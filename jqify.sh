cd attempt
for file in *; do cat $file | jq > ../attempt_jq/$file; done
