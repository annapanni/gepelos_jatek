name = input("Mit?")
nth = int(input("Minden hanyadikat?"))

f = open(name, "r")
words = f.read().split("\n")
a = map(lambda x: '"' + x[1] + '"', filter(lambda x: x[0]%nth==0 and x[1]!="", enumerate(words)))

outp = ", ".join(a)

outpName = name.split(".")[0]+"_lista.txt"
outf = open(outpName, "w")
outf.write("[" + outp +"]")
outf.close()