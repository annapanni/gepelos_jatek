name = input("Mit?")

f = open(name, "r")
words = f.read()[1:-1].replace(" ","").split(",")
a = map(lambda x: x[1:-1], words)

outp = "\n".join(a)

outpName = name.split(".")[0]+"_unlisted.txt"
outf = open(outpName, "w")
outf.write(outp)
outf.close()