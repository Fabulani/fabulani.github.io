import sys
import re
import itertools
import datetime
import numpy
import scipy.sparse
import matplotlib.pyplot as plt
import pdb

DATASETS = {}
DATASETS["abalone"] = {"in_file": "abalone.data",
                       "format": "data_txt", "sep": ","}
DATASETS["bats"] = {"in_file": "bats.mat", "format": "matrix", "sep": ","}
DATASETS["groceries"] = {"in_file": "groceries.csv",
                         "format": "trans_txt", "sep": ","}
DATASETS["house"] = {"in_file": "house.data", "format": "data_txt", "sep": ","}

# datetime can be used for tracking running time
# tic = datetime.datetime.now()
# [running some function that takes time]
# tac = datetime.datetime.now()
# print("Function running time: %s" % (tac-tic))
# print("The function took %s seconds to complete" % (tac-tic).total_seconds())


def load_trans_num(in_file, sep=" "):
    with open(in_file) as fp:
        tracts = [frozenset([int(s.strip()) for s in line.strip().split(sep)])
                  for line in fp if not re.match("#", line)]
    U = sorted(set().union(*tracts))
    return tracts, U


def load_trans_txt(in_file, sep=" "):
    with open(in_file) as fp:
        tracts = [frozenset([s.strip() for s in line.strip().split(sep)])
                  for line in fp if not re.match("#", line)]
    U = sorted(set().union(*tracts))
    map_items = dict([(v, k) for (k, v) in enumerate(U)])
    tracts = [frozenset([map_items[i] for i in t]) for t in tracts]
    return tracts, U


def load_matrix(in_file, sep=" "):
    with open(in_file) as fp:
        firstline = fp.readline()
        parts = firstline.strip().strip("#").split(sep)
        try:
            s = [k for (k, v) in enumerate(parts) if int(v) != 0]
            U = range(len(s))
            tracts = [frozenset(s)]
        except ValueError:
            U = parts
            tracts = []
        tracts.extend([frozenset([k for (k, v) in enumerate(line.strip().split(
            sep)) if int(v) != 0]) for line in fp if not re.match("#", line)])
    if len(U) <= max(set().union(*tracts)):
        print("Something went wrong while reading!")
        return [], []
    return tracts, U


def load_sparse_num(in_file, sep=" "):
    tracts = {}
    with open(in_file) as fp:
        for line in fp:
            if not re.match("#", line):
                i, j = map(int, line.strip().split(sep)[:2])
                if i not in tracts:
                    tracts[i] = []
                tracts[i].append(j)
    U = range(max(set().union(*tracts.values()))+1)
    tracts = [frozenset(tracts.get(ti, []))
              for ti in range(max(tracts.keys())+1)]
    return tracts, U


def load_sparse_txt(in_file, sep=" "):
    tracts = {}
    with open(in_file) as fp:
        for line in fp:
            if not re.match("#", line):
                i, j = line.strip().split(sep)[:2]
                i = int(i)
                if i not in tracts:
                    tracts[i] = []
                tracts[i].append(j)
    U = sorted(set().union(*tracts.values()))
    map_items = dict([(v, k) for (k, v) in enumerate(U)])
    tracts = [frozenset([map_items[i] for i in tracts.get(ti, [])])
              for ti in range(max(tracts.keys())+1)]
    return tracts, U


def load_data_txt(in_file, sep=" "):
    bin_file = ".".join(in_file.split(".")[:-1]+["bininfo"])
    bininfo, U = read_bininfo(bin_file)
    tracts = []
    with open(in_file) as fp:
        for line in fp:
            if not re.match("#", line):
                parts = line.strip().split(sep)
                t = []
                for k, part in enumerate(parts):
                    if k in bininfo:
                        if "bool" in bininfo[k]:
                            t.append(bininfo[k]["offset"]+1 *
                                     (part in bininfo[k]["bool"]))
                        elif "cats" in bininfo[k]:
                            if part in bininfo[k]["cats"]:
                                t.append(bininfo[k]["offset"] +
                                         bininfo[k]["cats"].index(part))
                        elif "bounds" in bininfo[k]:
                            off = 0
                            v = float(part)
                            while off < len(bininfo[k]["bounds"]) and v > bininfo[k]["bounds"][off]:
                                off += 1
                            t.append(bininfo[k]["offset"]+off)
                tracts.append(frozenset(t))
    return tracts, U


def read_bininfo(bin_file):
    bininfo = {}
    with open(bin_file) as fp:
        for line in fp:
            tmp = re.match(
                "^(?P<pos>[0-9]+) *(?P<name>[^ ]+) *(?P<type>\w+) *(?P<quote>[\'\"])(?P<details>.*)(?P=quote)", line)
            if tmp is not None:
                if tmp.group("type") == "BOL":
                    bininfo[int(tmp.group("pos"))] = {"bool": tmp.group(
                        "details").split(","), "name": tmp.group("name")}
                elif tmp.group("type") == "CAT":
                    bininfo[int(tmp.group("pos"))] = {"cats": tmp.group(
                        "details").split(","), "name": tmp.group("name")}
                else:
                    tt = re.search(
                        "equal\-(?P<type>(width)|(height)) *k=(?P<k>[0-9]+)", tmp.group("details"))
                    if tt is not None:
                        bininfo[int(tmp.group("pos"))] = {
                            "type": "equal-%s" % tt.group("type"), "k": int(tt.group("k")), "name": tmp.group("name")}
                    else:
                        try:
                            bininfo[int(tmp.group("pos"))] = {"type": "fixed", "bounds": sorted(
                                map(float, tmp.group("details").split(","))), "name": tmp.group("name")}
                        except ValueError:
                            pass

    fields = []
    ks = sorted(bininfo.keys())
    for k in ks:
        bininfo[k]["offset"] = len(fields)
        if "bool" in bininfo[k]:
            fields.extend(["%s_%s" % (bininfo[k]["name"], v)
                          for v in ["False", "True"]])
        elif "cats" in bininfo[k]:
            fields.extend(["%s_%s" % (bininfo[k]["name"], v)
                          for v in bininfo[k]["cats"]])
        elif "bounds" in bininfo[k]:
            fields.append("%s_:%s" %
                          (bininfo[k]["name"], bininfo[k]["bounds"][0]))
            fields.extend(["%s_%s:%s" % (bininfo[k]["name"], bininfo[k]["bounds"][i],
                          bininfo[k]["bounds"][i+1]) for i in range(len(bininfo[k]["bounds"])-1)])
            fields.append("%s_%s:" %
                          (bininfo[k]["name"], bininfo[k]["bounds"][-1]))
        elif "k" in bininfo[k]:
            fields.extend(["%s_bin%d" % (bininfo[k]["name"], v)
                          for v in range(bininfo[k]["k"])])
    return bininfo, fields


def save_trans_num(tracts, U, out_file, sep=" "):
    print("Writing to %s, %d transactions, %d items\n# %s" %
          (out_file, len(tracts), len(U), ",".join(["%s" % i for i in U])))
    with open(out_file, "w") as fo:
        fo.write(
            "\n".join([sep.join(["%d" % i for i in sorted(t)]) for t in tracts]))


def save_sparse_num(tracts, U, out_file, sep=" "):
    print("Writing to %s (sparse), %d transactions, %d items\n# %s" %
          (out_file, len(tracts), len(U), ",".join(["%s" % i for i in U])))
    with open(out_file, "w") as fo:
        fo.write("\n".join(["\n".join(["%d%s%d" % (ti, sep, i) for i in t])
                 for ti, t in enumerate(tracts) if len(t) > 0]))


def filter_trans(tracts, keep_items):
    map_items = dict([(v, k) for (k, v) in enumerate(keep_items)])
    keep_tids, ftracts = zip(*[(ti, frozenset([map_items[i] for i in t if i in map_items]))
                             for ti, t in enumerate(tracts) if len(t.intersection(keep_items)) > 0])
    return keep_tids, ftracts


def trans_to_array(tracts, U, sparse=False):
    """
        Return the binary matrix?
    """
    if sparse:
        M = scipy.sparse.lil_matrix((len(tracts), len(U)), dtype=bool)
    else:
        M = numpy.zeros((len(tracts), len(U)), dtype=bool)
    for ti, t in enumerate(tracts):
        M[ti, list(t)] = 1
    return M


def array_to_trans(M):
    trans = []
    U = list(range(M.shape[1]))
    for r in M:
        trans.append(frozenset(numpy.where(r)[0]))
    return trans, U


def plot_mat(M, U):
    plt.spy(M)
    plt.xticks(range(len(U)), U, rotation=50)
    plt.show()


if __name__ == "__main__":

    if len(sys.argv) < 2:
        print("Please choose a dataset: %s" % ", ".join(DATASETS.keys()))
        exit()
    which = sys.argv[1]

    if which not in DATASETS:
        print("Unknown setup (%s)!" % which)
        exit()
    try:
        method_load = eval("load_%s" % DATASETS[which]["format"])
    except AttributeError:
        raise Exception('No known method to load this data type (%)!' %
                        DATASETS[which]["format"])
    tracts, U = method_load(DATASETS[which]["in_file"], DATASETS[which]["sep"])

    # save_trans_num(tracts, U, "X_%s.dat" % which, " ")
    # M = trans_to_array(tracts, U)
