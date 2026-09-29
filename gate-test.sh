#!/bin/sh
# Tests for gate.sh. Run:  sh gate-test.sh   (or: sh gate-test.sh <another gate.sh>)
# Works on throwaway clones of the committed tree with their own harmless word
# list, so the real .gate-private and .gate-allow are never read or changed. The
# gate under test is the working copy of gate.sh unless another path is given;
# every other file (.gitignore included) comes from the last commit.

here=$(cd "$(dirname "$0")" && pwd)
gate=${1:-$here/gate.sh}
[ -f "$gate" ] || { echo "no gate at $gate"; exit 2; }
tmp=$(mktemp -d) || exit 2
trap 'rm -rf "$tmp"' EXIT

clones=0
fresh() {  # a new clone, so what one test commits cannot leak into the next
  clones=$((clones + 1)); site=$tmp/site$clones
  # --no-hardlinks: copies, so a run beside another run (or beside commits in
  # the same object store) cannot trip git's hardlink check mid-clone.
  git clone -q --no-hardlinks "$here" "$site" || { echo "GATE TESTS COULD NOT RUN: git clone failed"; exit 2; }
  cp "$gate" "$site/gate.sh" || { echo "GATE TESTS COULD NOT RUN: could not copy the gate"; exit 2; }
  git -C "$site" config user.name "$(git -C "$here" config user.name)"
  git -C "$site" config user.email "$(git -C "$here" config user.email)"
  # A valid list that matches nothing. (The brackets keep the word from matching
  # this file once it is committed.)
  printf 'zzqx-gate-c[o]ntrol-word\n' > "$site/.gate-private"
}

fails=0
must() {  # must <command...>: a setup step; if it fails, the run fails
  "$@" >/dev/null 2>&1 || { echo "FAIL  setup: $*"; fails=1; }
}
expect() {  # expect "<name>" <wanted exit> "<text the output must contain>" [more]...
  # more: "+text" must appear too, "=line" must be a whole output line, and
  # "!text" must not appear anywhere in the output.
  name=$1 want=$2 has=$3; shift 3
  out=$(sh "$site/gate.sh" 2>&1); rc=$?
  why=
  [ "$rc" -eq "$want" ] || why="exit $rc, wanted $want"
  printf '%s\n' "$out" | grep -qF -- "$has" || why="$why; no \"$has\""
  for a in "$@"; do
    case $a in
      +*) printf '%s\n' "$out" | grep -qF -- "${a#+}" || why="$why; no \"${a#+}\"" ;;
      =*) printf '%s\n' "$out" | grep -qxF -- "${a#=}" || why="$why; no line \"${a#=}\"" ;;
      !*) printf '%s\n' "$out" | grep -qF -- "${a#!}" && why="$why; has \"${a#!}\"" ;;
    esac
  done
  if [ -z "$why" ]; then
    echo "pass  $name"
  else
    echo "FAIL  $name (${why#; })"
    printf '%s\n' "$out" | sed 's/^/      /'
    fails=1
  fi
}

fresh
expect "valid list, clean tree: PASS" 0 "RESULT: PASS"

# Marker typos in config.js. The page reads the first kinds as unfilled, and the
# gate must still name every one. Each is added as one more line of text (the
# gate reads the file, it does not run it). The marker is split so this file
# never holds it.
m='T''ODO_'
typo() {  # typo "<what>" "<the value, printf escapes allowed>" [<key>]
  git -C "$site" checkout -q -- config.js
  printf "  ${3:-BACKING_TEXT}: \"$2\",\n" >> "$site/config.js"
  expect "$1: FAIL" 1 "FAIL  unfilled markers in config.js"
}
typo "RLM before the marker" "\342\200\217${m}x"
typo "LRM before the marker" "\342\200\216${m}x"
typo "zero-width space before the marker" "\342\200\213${m}x"
typo "marker in double quotes" '\\"'"${m}x"'\\"'
typo "marker in single quotes" "'${m}x'"
typo "marker in gershayim" "\327\264${m}x\327\264"
typo "marker in fullwidth letters" '\357\274\264\357\274\257\357\274\244\357\274\257_x'
typo "marker in the middle of a value" "\327\251\327\225\327\250\327\224 ${m}x"
git -C "$site" checkout -q -- config.js
printf '  EXTRA: "%sx",\n' "$m" >> "$site/config.js"
expect "marker spelled the one way: PASS" 0 "RESULT: PASS"

# C. A marker after a colon inside a value is still in the middle of that value.
# Only a marker that opens a value right after its key is the one right form.
typo "C1 marker after the date's colon inside a value" "עד 27.10: '${m}x'" SELECTION_STEP
typo "C2 marker after a word's colon inside a value" "note: '${m}x'"
typo "C3 marker after a comma and a colon inside a value" "a, b: '${m}x'"
git -C "$site" checkout -q -- config.js
printf '    { name: "%sa", role: "%sb", bio: "%sc", photo: "" },\n' "$m" "$m" "$m" >> "$site/config.js"
printf '  "QUOTED_KEY": "%sx",\n' "$m" >> "$site/config.js"
expect "C4 markers opening every value of a one-line entry, and after a quoted key: PASS" 0 "RESULT: PASS" \
  "+ok    unfilled markers in config.js open their value"
git -C "$site" checkout -q -- config.js

# A malformed pattern line must fail the private-word check by name, never read as clean.
printf 'zzqx-gate-c[o]ntrol-word\n(unclosed\n' > "$site/.gate-private"
expect "malformed pattern: FAIL" 1 "FAIL  no private words"
expect "malformed pattern: says the search did not run" 1 "SEARCH FAILED"

# A missing list is could-not-check, not a pass.
rm "$site/.gate-private"
expect "missing list: COULD NOT CHECK" 2 "RESULT: COULD NOT CHECK"

# A. The exact-line exception for the Owner's own config.js entry. w is the
# control word, split so this file never holds it. No output may ever carry it:
# findings name a place, never the text.
w='zzqx-gate-''control-word'
owner() { printf '    { name: "עמית פידל", role: "x", bio: "%s", photo: "" },' "$1"; }
last() { echo $(($(wc -l < "$site/config.js"))); }   # the number of config.js's last line
L1=$(owner "three years at $w")
L2=$(owner "three years at $w, then a founder")
entry() {  # entry "<line>" [<printf escape before the LF>]: config.js as committed, plus that line
  git -C "$site" checkout -q -- config.js
  printf "%s$2\n" "$1" >> "$site/config.js"
}

fresh
entry "$L1"; n1=$(last)
printf '%s\n' "$L1" > "$site/.gate-allow"
expect "E1 Owner entry line, exact copy in .gate-allow: PASS" 0 "RESULT: PASS" "+match(es) allowed" "!$w"
entry "$L1" '\r'
expect "E1 the same line with a CRLF line end (a Windows checkout): PASS" 0 "RESULT: PASS" \
  "+match(es) allowed" "!$w"
entry "$L1"
printf '%s' "$L1" > "$site/.gate-allow"
expect "E1 .gate-allow without a final newline: PASS" 0 "RESULT: PASS" "+match(es) allowed" "!$w"
rm "$site/.gate-allow"
expect "E2 the same line, no .gate-allow: FAIL, named as path:line" 1 "FAIL  no private words" \
  "=      config.js:$n1" "!$w"
printf '%s\n' "$L1" > "$site/.gate-allow"
printf '%s\n' "$L1" >> "$site/index.html"
expect "E3 E1 plus the same line in index.html: FAIL, names index.html only" 1 "FAIL  no private words" \
  "=      index.html" "!      config.js" "!$w"
git -C "$site" checkout -q -- index.html
printf '%s\n' "$L1" > "$site/qa/config.js"
expect "E3 the same line in another file named config.js (qa/config.js): FAIL, names it only" 1 \
  "FAIL  no private words" "=      qa/config.js" "!      config.js" "!$w"
rm "$site/qa/config.js"
printf '    { name: "x", role: "x", bio: "%s", photo: "" },\n' "$w" >> "$site/config.js"; n2=$(last)
expect "E4 E1 plus the word on another member's config.js line: FAIL, names that line only" 1 \
  "FAIL  no private words" "=      config.js:$n2" "!      config.js:$n1" "!$w"
entry "$L1"
printf '%s \n' "$L1" > "$site/.gate-allow"
expect "E5 .gate-allow line one trailing space longer: FAIL" 1 "FAIL  no private words" \
  "=      config.js:$n1" "!$w"
printf '%s\n' "$L1" > "$site/.gate-allow"
entry "$L1" ' '
expect "E5 the config.js line one trailing space longer: FAIL" 1 "FAIL  no private words" \
  "=      config.js:$n1" "!$w"
# Checks 2 and 7 print config.js lines by number only, since the allowed line holds the word.
L3=$(owner "three years at $w$(printf '\357\274\214') then a founder")   # a fullwidth comma
entry "$L3"
printf '%s\n' "$L3" > "$site/.gate-allow"
expect "E11 the allowed line with a fullwidth comma: check 7 FAIL by line number, never the word" 1 \
  "FAIL  unfilled markers in config.js" "=      config.js:$n1" "+ok    no private words" "!$w"
L4=$(owner "three years at $w, check: yes")
entry "$L4"
printf '%s\n' "$L4" > "$site/.gate-allow"
expect "E11 the allowed line holding a check flag: check 2 FAIL by line number, never the word" 1 \
  "FAIL  no FAQ item carries a check flag" "=      config.js:$n1" "+ok    no private words" "!$w"

fresh
entry "$L1"
printf '%s\n' "$L1" > "$site/.gate-allow"
must git -C "$site" commit -q --allow-empty -m "$L1"
c=$(git -C "$site" rev-parse HEAD)
expect "E6 E1 plus an empty commit whose message is that line: FAIL, names the message" 1 \
  "FAIL  no private words" "=      $c: message line 1" "!      config.js" "!$w"

fresh
entry "$L1"; n1=$(last)
printf '%s\n' "$L1" > "$site/.gate-allow"
must git -C "$site" commit -q -am "Owner entry"
c1=$(git -C "$site" rev-parse HEAD)
must git -C "$site" grep -q -F -e "$L1" "$c1" -- config.js
must git -C "$site" checkout -q HEAD~1 -- config.js
expect "E7 the line committed, the working tree changed back: history allowed, PASS" 0 "RESULT: PASS" \
  "+match(es) allowed" "!$w"
printf '%s\n' "$L2" >> "$site/config.js"
printf '%s\n%s\n' "$L1" "$L2" > "$site/.gate-allow"
expect "E7 the entry edited, both versions in .gate-allow: PASS" 0 "RESULT: PASS" "!$w"
printf '%s\n' "$L2" > "$site/.gate-allow"
expect "E7 only the new version in .gate-allow: FAIL, names the old one in history" 1 \
  "FAIL  no private words" "=      $c1:config.js:$n1" "!      config.js:" "!$w"
printf '%s\n%s\n' "$L1" "$L2" > "$site/.gate-allow"
printf '%s\n' "$L1" > "$site/notes.txt"
must git -C "$site" add notes.txt
must git -C "$site" commit -q -m "notes" -- notes.txt
c2=$(git -C "$site" rev-parse HEAD)
must git -C "$site" rm -q notes.txt
must git -C "$site" commit -q -m "drop notes" -- notes.txt
expect "E7 the line committed in another file, then deleted: FAIL, names it in history" 1 \
  "FAIL  no private words" "=      $c2:notes.txt" "!      config.js" "!:config.js:" "!$w"

fresh
entry "$L1"
printf '    { name: "x", role: "x", bio: "%s", photo: "" },\n' "$w" > "$site/.gate-allow"
expect "E8 .gate-allow holding another name's entry: COULD NOT CHECK" 2 "COULD NOT CHECK  .gate-allow line 1" "!$w"
printf '    { name: "עמית פידל", role: "%s", photo: "" },\n' "$w" > "$site/.gate-allow"
expect "E8 .gate-allow line without bio: COULD NOT CHECK" 2 "COULD NOT CHECK  .gate-allow line 1" "!$w"
printf '%s\n%s { name: "x", bio: "%s" },\n' "$L1" "$L1" "$w" > "$site/.gate-allow"
expect "E8 .gate-allow line holding the Owner entry and a second one: COULD NOT CHECK" 2 \
  "COULD NOT CHECK  .gate-allow line 2" "!$w"
printf '%s\n\n' "$L1" > "$site/.gate-allow"
expect "E8 .gate-allow with a blank line: COULD NOT CHECK" 2 "COULD NOT CHECK  .gate-allow line 2" "!$w"
printf '%s\n' "$L1" > "$site/.gate-allow"
printf '!.gate-allow\n' >> "$site/.gitignore"
expect "E9 .gate-allow not gitignored: COULD NOT CHECK" 2 "COULD NOT CHECK  .gate-allow must be gitignored" "!$w"

# Names are never exempt either: an author or committer name with the word fails.
fresh
must env GIT_AUTHOR_NAME="x $w" git -C "$site" commit -q --allow-empty -m "note"
c=$(git -C "$site" rev-parse HEAD)
expect "E10 an author name holding the word: FAIL, names the field" 1 "FAIL  no private words" \
  "=      $c: author name" "!committer name" "!$w"
must env GIT_COMMITTER_NAME="x $w" git -C "$site" commit -q --allow-empty -m "note"
c=$(git -C "$site" rev-parse HEAD)
expect "E10 a committer name holding the word: FAIL, names the field" 1 "FAIL  no private words" \
  "=      $c: committer name" "!$w"

# B. A list that starts with a BOM or holds a CR is refused, never repaired.
fresh
printf '<p>%s</p>\n' "$w" >> "$site/index.html"
printf '\357\273\277zzqx-gate-c[o]ntrol-word\n' > "$site/.gate-private"
expect "B1 .gate-private with a UTF-8 BOM, the word in index.html: COULD NOT CHECK" 2 "BOM" \
  "+.gate-private" "!PASS" "!$w"
printf '\377\376z\000z\000\n\000' > "$site/.gate-private"
expect "B1 .gate-private with a UTF-16 BOM: COULD NOT CHECK" 2 "UTF-16 BOM" "+.gate-private" "!PASS" "!$w"
printf 'zzqx-gate-c[o]ntrol-word\n' > "$site/.gate-private"
expect "B2 the same list without the BOM: FAIL (the pattern fires)" 1 "FAIL  no private words" \
  "=      index.html" "!$w"
printf 'zzqx-gate-c[o]ntrol-word\r\n' > "$site/.gate-private"
expect "B3 the list with CRLF line ends: COULD NOT CHECK" 2 "CR byte" "+.gate-private" "!PASS" "!$w"
printf 'zzqx-gate-c[o]ntrol-word\n' > "$site/.gate-private"
git -C "$site" checkout -q -- index.html
entry "$L1"
printf '\357\273\277%s\n' "$L1" > "$site/.gate-allow"
expect "B4 .gate-allow with a BOM: COULD NOT CHECK, names the file" 2 "COULD NOT CHECK  .gate-allow" \
  "+BOM" "!$w"
printf '%s\r\n' "$L1" > "$site/.gate-allow"
expect "B4 .gate-allow with CRLF line ends: COULD NOT CHECK, names the file" 2 "COULD NOT CHECK  .gate-allow" \
  "+CR byte" "!$w"

[ "$fails" -eq 0 ] && echo "ALL GATE TESTS PASS" || { echo "GATE TESTS FAILED"; exit 1; }
