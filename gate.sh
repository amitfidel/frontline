#!/bin/sh
# FRONTLINE publish gate. Run before every push:  sh gate.sh
# Exit 0 = PASS. 1 = a finding (printed below). 2 = could not check (treat as a fail).
#
# It checks what can be published: every commit, their messages, and the files
# git would add (tracked plus untracked, minus .gitignore). Patterns are written
# with [x] brackets so this file never matches itself. The private word list
# lives in .gate-private, which is gitignored on purpose: listing those words
# here would publish them.

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

# 1. Unfilled markers live only in config.js (README.md documents them).
report "unfilled markers only in config.js" \
  "$(g git grep --untracked -nIE 'T[O]DO_' -- . ':!config.js' ':!README.md')"

# 2. The retired FAQ draft flag: every undecided answer must be a {KEY} placeholder.
report "no FAQ item carries a check flag" "$(g grep -nE 'c[h]eck[[:space:]]*:' config.js)"

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

# 6. Private words (employer, internal project names), from the local list.
if ! git check-ignore -q .gate-private 2>/dev/null; then
  echo "COULD NOT CHECK  .gate-private must exist here and be gitignored"; unknown=1
elif [ ! -s .gate-private ]; then
  echo "COULD NOT CHECK  .gate-private is missing or empty"; unknown=1
else
  report "no private words in files, history or commit messages" "$(
    g git grep --untracked -l -a -i -E -f .gate-private
    [ -n "$revs" ] && g git grep -l -a -i -E -f .gate-private $revs
    git log --all --format=%B | g grep -niE -f .gate-private)"
fi

# 7. In config.js every unfilled marker opens its value, spelled exactly as the
#    header says, and nothing is in fullwidth letters. A marker behind a quote, an
#    invisible direction mark or a space, or in the middle of a value, is named by
#    line: the page shows a chip for the first kinds, but prints one in the middle
#    as text. Comment lines are skipped. The last grep keeps a SEARCH FAILED line,
#    so a failed first search still fails the check.
FULLWIDTH=$(printf '\357\274[\201-\277]|\357\275[\200-\236]')  # U+FF01-FF5E as UTF-8 bytes
report "unfilled markers in config.js open their value, spelled one way" "$(
  g grep -nvE '^[[:space:]]*(/?\*|//)' config.js |
    sed -E "s/[[:alnum:]_]+[\"']?:[[:space:]]*[\"']T[O]DO_//g" | g grep -iE 't[o]do|^SEARCH FAILED'
  g env LC_ALL=C grep -nE "$FULLWIDTH" config.js)"

echo
echo "By hand: open the page and search for \"לבדוק\". It must find nothing."
echo "Every \"למילוי\" chip still on the page should be one you chose to publish."

[ "$found" -eq 1 ] && { echo "RESULT: FAIL"; exit 1; }
[ "$unknown" -eq 1 ] && { echo "RESULT: COULD NOT CHECK"; exit 2; }
echo "RESULT: PASS"
