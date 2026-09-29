#!/bin/sh
# FRONTLINE publish gate. Run before every push:  sh gate.sh
# Exit 0 = PASS. 1 = a finding (printed below). 2 = could not check (treat as a fail).
#
# It checks what can be published: every commit, their messages, and the files
# git would add (tracked plus untracked, minus .gitignore). Patterns are written
# with [x] brackets so this file never matches itself. The private word list
# lives in .gate-private, which is gitignored on purpose: listing those words
# here would publish them. .gate-allow, gitignored too, holds the one exception
# to that list (check 6).

cd "$(dirname "$0")" || exit 2
git rev-parse --git-dir >/dev/null 2>&1 || { echo "COULD NOT CHECK: not a git repository"; exit 2; }

found=0
unknown=0
# Every search runs through g. grep exits 0 on a match and 1 on none; anything
# else (a malformed pattern, a missing file) means the search did not run, so it
# is printed as a finding and the check FAILS instead of reading as clean.
g() {
  "$@"
  rc=$?
  [ "$rc" -gt 1 ] && echo "SEARCH FAILED (exit $rc), so this check did not run: $1 $2"
  return 0
}
# A filter between a search and its report runs through f, which is stricter:
# any exit but 0 is printed the same way, so a filter that dies cannot turn a
# finding into silence.
f() {
  "$@"
  rc=$?
  [ "$rc" -ne 0 ] && echo "SEARCH FAILED (exit $rc), so this check did not run: $1 $2"
  return 0
}
report() {  # report "<what>" "<findings, empty when clean>"
  if [ -n "$2" ]; then
    echo "FAIL  $1"
    printf '%s\n' "$2" | sed 's/^/      /'
    found=1
  else
    echo "ok    $1"
  fi
}
revs=$(git rev-list --all)
# AT turns grep -n output of config.js into config.js:<line>, never its text:
# check 6 lets one config.js line hold a private word, so no check may print a
# config.js line. SEARCH FAILED lines pass through as they are.
AT='/^SEARCH FAILED/ { print; next } { print "config.js:" $1 }'

# 1. Unfilled markers live only in config.js (README.md documents them).
report "unfilled markers only in config.js" \
  "$(g git grep --untracked -nIE 'T[O]DO_' -- . ':!config.js' ':!README.md')"

# 2. The retired FAQ draft flag: every undecided answer must be a {KEY} placeholder.
report "no FAQ item carries a check flag" \
  "$(g grep -nE 'c[h]eck[[:space:]]*:' config.js | f env LC_ALL=C awk -F: "$AT")"

# 3. Commits carry only the GitHub noreply identity, and so will the next one.
NOREPLY='[0-9]+\+a[m]itfidel@users\.noreply\.github\.com'
report "author and committer are the noreply address" \
  "$( { git log --all --format='%ae%n%ce'; git config user.email; } | sort -u | g grep -vxE "$NOREPLY")"

# 4. The GitHub handle may appear only as the site URL, the repo name, the bare
#    username or the noreply address. Anything else (a Windows user folder, its
#    short 8.3 form) is a finding. Checked in files, every commit and messages.
TOKEN='[[:alnum:]._:/\\~+@%-]*a[m]itfi[[:alnum:]._:/\\~+@%-]*'
ALLOWED="a[m]itfidel|a[m]itfidel/frontline|(https://)?a[m]itfidel\.github\.io/frontline/[[:alnum:]._/-]*|$NOREPLY"
report "the handle appears only in its intended forms" "$(
  { g git grep --untracked -hoiIE "$TOKEN"
    [ -n "$revs" ] && g git grep -hoiIE "$TOKEN" $revs
    git log --all --format=%B | g grep -oiE "$TOKEN"
  } | sort -u | g grep -vxE "$ALLOWED")"

# 5. Local machine paths, in text and binary files, now and in history.
PATHS='[a-z]:[\\/]+u[s]ers[\\/]|/c/u[s]ers/|a[p]pdata|f[i]le:///|a[m]itfi~[0-9]'
report "no local machine paths" "$(
  g git grep --untracked -l -a -i -E "$PATHS"
  [ -n "$revs" ] && g git grep -l -a -i -E "$PATHS" $revs)"

# 6. Private words (employer, internal project names), from the local list: in
#    the files, every commit, the commit messages, and the author and committer
#    names. One exception, for config.js only (the site owner's decision): a line
#    that equals, byte for byte, a line of .gate-allow is not a finding, in the
#    working tree or in history. A CR at the end of a config.js line is its
#    Windows line end, not part of the line. .gate-allow must be gitignored like
#    the list, and every line in it must be one team entry, the one with
#    name: "עמית פידל", alone on the line and with bio: " in it. It holds more than
#    one line only because history keeps older versions of that entry. No
#    .gate-allow means no exception. Either file is refused, not repaired, when it starts with a BOM or
#    holds a CR byte: both can make a pattern or a line miss without a sound.
#    Findings name a place (path, path:line, rev:path:line, commit and field),
#    never the matched text, so a pasted report cannot carry a word. The errors
#    of these searches are silenced for the same reason: git grep quotes a bad
#    pattern in its error.
LISTFIX='save as UTF-8 without BOM, LF line ends'
OWNER='name: "עמית פידל"'
badbytes() {  # badbytes <file>: what makes the file unusable as a list, or nothing
  hex=$(od -An -tx1 -v "$1" 2>/dev/null) || { echo "could not be read"; return; }
  set -- $hex
  case "$1$2$3" in efbbbf) echo "starts with a UTF-8 BOM"; return ;; esac
  case "$1$2" in fffe|feff) echo "starts with a UTF-16 BOM"; return ;; esac
  case " $* " in *" 0d "*) echo "holds a CR byte (Windows line ends)" ;; esac
}
cannot() { echo "COULD NOT CHECK  $*"; unknown=1; run6=0; }
run6=1
if ! git check-ignore -q .gate-private 2>/dev/null; then
  cannot ".gate-private must exist here and be gitignored"
elif [ ! -s .gate-private ]; then
  cannot ".gate-private is missing or empty"
else
  why=$(badbytes .gate-private)
  [ -n "$why" ] && cannot ".gate-private $why. Fix: $LISTFIX."
fi
allow=
if [ -e .gate-allow ] || [ -L .gate-allow ]; then
  if ! git check-ignore -q .gate-allow 2>/dev/null; then
    cannot ".gate-allow must be gitignored, like .gate-private"
  elif [ ! -f .gate-allow ] || [ ! -r .gate-allow ]; then
    cannot ".gate-allow must be a readable file"
  else
    why=$(badbytes .gate-allow)
    if [ -n "$why" ]; then
      cannot ".gate-allow $why. Fix: $LISTFIX."
    # bad = the number of the first line that is not that one entry
    elif ! bad=$(LC_ALL=C awk -v owner="$OWNER" '
        index($0, owner) && index($0, "bio: \"") {
          s = $0
          if (gsub(/(^|[^A-Za-z0-9_])name["\047]?[ \t]*:/, "", s) == 1) next
        }
        { print NR; exit }' .gate-allow); then
      cannot ".gate-allow could not be read"
    elif [ -n "$bad" ]; then
      cannot ".gate-allow line $bad is not the one allowed team entry (one entry, with $OWNER and bio: \", in UTF-8)"
    else
      allow=.gate-allow
    fi
  fi
fi
# EXEMPT reads config.js hits, drops each whose whole line equals a .gate-allow
# line (printing /allowed for the count: git never prints a path that starts
# with a slash, so no file name can pose as one), and prints the others as
# their place only. k is the number of fields before the text: 2 in the working
# tree (path:line:), 3 in history (rev:path:line:). BINMODE=3 stops awk on
# Windows from dropping a CR on its own, so the one strip below is the only one,
# on every system.
EXEMPT='
BEGIN {
  if (allow != "") {
    while ((r = (getline l < allow)) > 0) ok[l] = 1
    if (r < 0) print "SEARCH FAILED, " allow " could not be read"
  }
}
/^SEARCH FAILED/ { print; next }
{
  p = 0
  for (j = 0; j < k; j++) { x = index(substr($0, p + 1), ":"); if (!x) break; p += x }
  if (j < k) { print "config.js: a match the gate could not place"; next }
  t = substr($0, p + 1); sub(/\r$/, "", t)
  if (t in ok) print "/allowed"; else print substr($0, 1, p - 1)
}'
# FIELD names the field of a commit that matched: line 1 of its input is the
# author name, line 2 the committer name, the rest the message.
FIELD='
/^SEARCH FAILED/ { print; next }
$1 == 1 { print c ": author name"; next }
$1 == 2 { print c ": committer name"; next }
{ print c ": message line " ($1 - 2) }'
if [ "$run6" -eq 1 ]; then
  hits=$(
    g git grep --untracked -l -a -i -E -f .gate-private -- . ':!config.js' 2>/dev/null
    [ -n "$revs" ] && g git grep -l -a -i -E -f .gate-private $revs -- . ':!config.js' 2>/dev/null
    g git -c grep.column=false grep --no-color --untracked -n -a -i -E -f .gate-private -- config.js 2>/dev/null |
      f env LC_ALL=C awk -v BINMODE=3 -v k=2 -v allow="$allow" "$EXEMPT"
    [ -n "$revs" ] && g git -c grep.column=false grep --no-color -n -a -i -E -f .gate-private $revs -- config.js 2>/dev/null |
      f env LC_ALL=C awk -v BINMODE=3 -v k=3 -v allow="$allow" "$EXEMPT"
    for c in $revs; do
      if ! m=$(git log -1 --format='%an%n%cn%n%B' "$c" 2>/dev/null); then
        echo "SEARCH FAILED, commit $c could not be read"; break
      fi
      out=$(printf '%s\n' "$m" | g grep -n -i -E -f .gate-private 2>/dev/null | f env LC_ALL=C awk -F: -v c="$c" "$FIELD")
      [ -n "$out" ] && printf '%s\n' "$out"
      case $out in *"SEARCH FAILED"*) break ;; esac   # the same list fails the same way
    done)
  list=; n6=0
  while IFS= read -r l; do
    case $l in
      /allowed) n6=$((n6 + 1)) ;;
      ?*) list="${list:+$list
}$l" ;;
    esac
  done <<EOF
$hits
EOF
  report "no private words in files, history, commit messages or names" "$list"
  [ "$n6" -gt 0 ] && echo "      ($n6 config.js match(es) allowed: the whole line equals a .gate-allow line)"
  case $list in
    *"SEARCH FAILED"*) echo "      (A pattern in .gate-private may be malformed: grep -E -f .gate-private </dev/null names its line.)" ;;
  esac
fi

# 7. In config.js every unfilled marker opens its value, spelled exactly as the
#    header says, and nothing is in fullwidth letters. A marker behind a quote, an
#    invisible direction mark or a space, or in the middle of a value, is named by
#    line: the page shows a chip for the first kinds, but prints one in the middle
#    as text. Comment lines are skipped. KEYMARK walks each line's quoted strings
#    and drops a marker only where a quoted value opens with it right after a
#    key's colon, so one after a colon inside a value ("27.10: '...") is still
#    named. Lines are named as config.js:<line> (see AT). The last grep keeps a
#    SEARCH FAILED line, so a failed first search still fails the check.
KEYMARK='
{
  n = length($0); i = index($0, ":"); o = substr($0, 1, i); i++; q = ""; key = 0
  while (i <= n) {
    c = substr($0, i, 1)
    if (q != "") {
      if (c == "\\") { o = o substr($0, i, 2); i += 2; continue }
      if (c == q) q = ""
    } else if (c == "\"" || c == "\047") {
      q = c
      if (key && substr($0, i + 1, 5) ~ /^T[O]DO_$/) { o = o c; i += 6; key = 0; continue }
    } else if (c == "/" && substr($0, i + 1, 1) == "/") {
      o = o substr($0, i); break
    } else if (c == ":") {
      key = 1; o = o c; i++; continue
    }
    if (c != " " && c != "\t") key = 0
    o = o c; i++
  }
  print o
}'
FULLWIDTH=$(printf '\357\274[\201-\277]|\357\275[\200-\236]')  # U+FF01-FF5E as UTF-8 bytes
report "unfilled markers in config.js open their value, spelled one way" "$(
  g grep -nvE '^[[:space:]]*(/?\*|//)' config.js | f env LC_ALL=C awk "$KEYMARK" |
    g grep -iE 't[o]do|^SEARCH FAILED' | f env LC_ALL=C awk -F: "$AT"
  g env LC_ALL=C grep -nE "$FULLWIDTH" config.js | f env LC_ALL=C awk -F: "$AT")"

echo
echo "By hand: open the page and search for \"לבדוק\". It must find nothing."
echo "Every \"למילוי\" chip still on the page should be one you chose to publish."

[ "$found" -eq 1 ] && { echo "RESULT: FAIL"; exit 1; }
[ "$unknown" -eq 1 ] && { echo "RESULT: COULD NOT CHECK"; exit 2; }
echo "RESULT: PASS"
