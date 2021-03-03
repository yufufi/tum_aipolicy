set file master.out

rm $file

cat frontmatter.yaml >> $file

for f in *.md
    echo $f
    cat $f >> $file
    echo "" >> $file
end

pandoc -f markdown $file -o master.pdf --citeproc --toc --pdf-engine xelatex
