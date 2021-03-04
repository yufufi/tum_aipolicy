set file report.out

rm $file

cat frontmatter.yaml >> $file

for f in *.md
    echo $f
    cat $f >> $file
    echo "" >> $file
end

echo "# Bibliography" >> $file
echo "" >> $file

pandoc -f markdown $file -o report.pdf --citeproc --toc --pdf-engine xelatex
rm report.out
