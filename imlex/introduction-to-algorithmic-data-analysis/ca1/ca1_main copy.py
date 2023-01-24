from fim_resources import *
import logging


def support_count(dataset, itemset: set) -> int:
    """
        Given `dataset` and a desired `itemset`, returns the support count
        `supp_count` of the `itemset`.

        `dataset`: tracts, U.
        `itemset`: the itemset to count the support value of. The items must be
        the attribute names in string format.

        return `supp_count`: the support count for the `itemset`.
    """
    tracts = dataset[0]
    U = dataset[1]

    # Create a dict with attribute strings as keys, and id as value
    id_map = {attrb: U.index(attrb) for attrb in U}

    # Replace attribute strings with ids
    itemset = {id_map[attrb] for attrb in itemset}

    # Support count
    supp_count = 0
    for transaction in tracts:
        if itemset <= transaction:  # the itemset is a subset of the transaction
            supp_count += 1  # increment support count
    return supp_count


def attrb_to_id(U: list, itemset: frozenset):
    """
        Convert attrbs from column name to id.

        `U`: list of column names (attributes)
        `itemset`: itemset with attributes as strings

        return itemset with attributes as ids.
    """
    return {U.index(attrb) for attrb in itemset}


def apriori_freq(itemsets: dict, min_supp: int):
    """
        Method for the apriori algorithm to return frequent itemsets of a level.
    """
    # Frequent itemset initialization
    f_itemsets = {}  # Frequent itemsets
    for i in itemsets:
        if itemsets[i] >= min_supp:  # Minimum support threshold to be frequent
            # Add itemset to frequent itemsets as a frozenset with its support count
            try:
                if len(i) == 1:
                    f_itemsets[frozenset([i])] += itemsets[i]
                else:
                    f_itemsets[i] += itemsets[i]
            except KeyError:  # Occurs when items doesn't exist in dict
                if len(i) == 1:
                    f_itemsets[frozenset([i])] = itemsets[i]
                else:
                    f_itemsets[i] = itemsets[i]
    return f_itemsets


def apriori(dataset, min_supp: int):
    """
        Apriori algorithm implementation.
    """
    # Initialize
    transactions = dataset[0]  # list of frozensets
    singletons = dataset[1]  # {"Sex_M", "Sex_F", ...}
    itemsets = {}

    # Support counting of singletons
    for s in singletons:  # Count support of singletons
        itemset = frozenset([s])
        itemsets[itemset] = support_count(dataset, itemset)

    # Frequent itemsets
    f_itemsets = apriori_freq(itemsets, min_supp)
    itemsets = f_itemsets  # Prunning
    two_itemsets = {}
    k = 0
    j = k + 1
    while k < len(itemsets)-1:
        while j < len(itemsets):
            itemset = list(itemsets)[k].union(list(itemsets)[j])
            two_itemsets[itemset] = support_count(dataset, itemset)
            j += 1
        k += 1
        j = k + 1
    f_itemsets = f_itemsets | apriori_freq(itemsets, min_supp)  # Merge
    return f_itemsets


if __name__ == "__main__":
    logging.basicConfig(format='[%(levelname)s:%(lineno)d] %(message)s',
                        level=logging.DEBUG)

    logging.info("Loading datasets.")

    # Load datasets
    dataset = dict()
    dataset['abalone'] = load_data_txt(
        DATASETS["abalone"]["in_file"], DATASETS["abalone"]["sep"])
    dataset['bats'] = load_matrix(
        DATASETS["bats"]["in_file"], DATASETS["bats"]["sep"])
    dataset['groceries'] = load_trans_txt(
        DATASETS["groceries"]["in_file"], DATASETS["groceries"]["sep"])
    dataset['house'] = load_data_txt(
        DATASETS["house"]["in_file"], DATASETS["house"]["sep"])

    logging.info(f"Datasets loaded: {dataset.keys()}.")

    logging.info("Executing apriori.")

    frequent_itemsets = apriori(dataset['abalone'], 10)
