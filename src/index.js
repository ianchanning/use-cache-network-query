import client from "@apollo/client";

const { useQuery } = client;

/**
 * Magic query that properly uses the cache
 *
 * Trying to use 'cache-first' fetchPolicy is a nightmare
 * You have to manually maintain it everywhere
 * 'cache-and-network' is great, unless you use a loading spinner
 * For cache-and-network getting from the cache is still classed as loading
 * All the code we have returns an empty array on loading
 * This just says that it's loading **only if there is no cache**
 * Apollo handles the re-render once the network request updates the cache
 * {@link https://github.com/apollographql/apollo-client/issues/8669#issuecomment-978012147}
 *
 * @param {import('graphql').DocumentNode} query
 * @param {import('@apollo/client').QueryHookOptions} options
 * @returns {import('@apollo/client').QueryResult}
 */
const useCacheNetworkQuery = (query, options) => {
    const result = useQuery(query, {
        ...options,
        fetchPolicy: "cache-and-network",
    });
    const cache = result.client.readQuery({
        query,
        variables: options?.variables,
    });

    return { ...result, loading: result.loading && !cache };
};

export default useCacheNetworkQuery;
