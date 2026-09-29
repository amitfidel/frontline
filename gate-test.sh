#!/bin/sh
# Tests for gate.sh. Run:  sh gate-test.sh   (or: sh gate-test.sh <another gate.sh>)
# Works on a throwaway clone of the committed tree with its own harmless word
# list, so the real .gate-private is never read or changed. The gate under test
# is the working copy of gate.sh unless another path is given.

here=$(cd "$(dirname "$0")" && pwd)
gate=${1:-$here/gate.sh}
[ -f "$gate" ] || { echo "no gate at $gate"; exit 2; }
tmp=$(mktemp -d) || exit 2
trap 'rm -rf "$tmp"' EXIT
git clone -q "$here" "$tmp/site" || exit 2
cp "$gate" "$tmp/site/gate.sh" || exit 2
git -C "$tmp/site" config user.name "$(git -C "$here" config user.name)"
git -C "$tmp/site" config user.email "$(git -C "$here" config user.email)"

fails=0
expect() {  # expect "<name>" <wanted exit> "<text the output must contain>"
  out=$(sh "$tmp/site/gate.sh" 2>&1); rc=$?
  if [ "$rc" -eq "$2" ] && printf '%s' "$out" | grep -qF -- "$3"; then
    echo "pass  $1"
  else
    echo "FAIL  $1 (exit $rc, wanted $2 and \"$3\")"
    printf '%s\n' "$out" | sed 's/^/      /'
    fails=1
  fi
}

# Control: a valid list that matches nothing passes.
# (The brackets keep the word from matching this file once it is committed.)
printf 'zzqx-gate-c[o]ntrol-word\n' > "$tmp/site/.gate-private"
expect "valid list, clean tree: PASS" 0 "RESULT: PASS"

# Marker typos in config.js. The page reads the first kinds as unfilled, and the
# gate must still name every one. Each is added as one more line of text (the
# gate reads the file, it does not run it). The marker is split so this file
# never holds it.
m='T''ODO_'
typo() {  # typo "<what>" "<the value, printf escapes allowed>"
  git -C "$tmp/site" checkout -q -- config.js
  printf "  BACKING_TEXT: \"$2\",\n" >> "$tmp/site/config.js"
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
git -C "$tmp/site" checkout -q -- config.js
printf '  EXTRA: "%sx",\n' "$m" >> "$tmp/site/config.js"
expect "marker spelled the one way: PASS" 0 "RESULT: PASS"
git -C "$tmp/site" checkout -q -- config.js

# A malformed pattern line must fail the private-word check by name, never read as clean.
printf 'zzqx-gate-c[o]ntrol-word\n(unclosed\n' > "$tmp/site/.gate-private"
expect "malformed pattern: FAIL" 1 "FAIL  no private words"
expect "malformed pattern: says the search did not run" 1 "SEARCH FAILED"

# A missing list is could-not-check, not a pass.
rm "$tmp/site/.gate-private"
expect "missing list: COULD NOT CHECK" 2 "RESULT: COULD NOT CHECK"

[ "$fails" -eq 0 ] && echo "ALL GATE TESTS PASS" || { echo "GATE TESTS FAILED"; exit 1; }
