# use-cache-network-query [![npm version](https://img.shields.io/npm/v/use-cache-network-query.svg?style=flat)](https://www.npmjs.com/package/use-cache-network-query)

## The problem

You're using Apollo Client `useQuery` for [`fetchPolicy`](https://www.apollographql.com/docs/react/data/queries#setting-a-fetch-policy) 'cache-and-network' that checks the cache before refetching in the background, but you still always get a loading spinner showing until the network query returns.

This is a wrapper around `useQuery` that returns `loading` as false if you have a cache.

Now the `loading` should work as you expect, your UI will not show a loading spinner if there is cache and then when the network query completes Apollo will re-render the component for you.

## Example

From the [Apollo docs - Setting a fetch policy](https://www.apollographql.com/docs/react/data/queries#setting-a-fetch-policy), replace:

```js
const { loading, error, data } = useQuery(GET_DOGS, {
  fetchPolicy: 'cache-and-network',
  // other options
});

if (loading) {
    return (...)
}
```

with:

```js
const { loading, error, data } = useCacheNetworkQuery(GET_DOGS, {
  // other options
});

if (loading) {
    return (...)
}
```

That's it, `useQuery -> useCacheNetworkQuery` and remove `fetchPolicy` option.

## Why

Apollo's `useQuery` defaults to only ever checking the cache if it exists. This is via the [`fetchPolicy`](https://www.apollographql.com/docs/react/data/queries#setting-a-fetch-policy) that is 'cache-first'.

In my opinion, if you have a normal size app (tens not hundreds of queries), then dealing with the impact of a `fetchPolicy` of 'cache-first' for a list of items has a massive overhead. You have to:

1. Handle cache from add and delete mutations
1. Handle any cached queries using variables for add and delete mutations
1. Handle any server side changes

You have to add this boilerplate for every single one of your list item queries.

You can do all that or just add this to your `useQuery` options:

```js
{
  fetchPolicy: 'cache-and-network'
}
```

As per the [Apollo docs](https://www.apollographql.com/docs/react/data/queries#supported-fetch-policies):

> Apollo Client executes the full query against both the cache _and_ your GraphQL server. The query automatically updates if the result of the server-side query modifies cached fields.
>
> Provides a fast response while also helping to keep cached data consistent with server data.

The problem with this is that if you have a loading spinner, the query sets `loading` to true even though it is fetching directly from the cache. So if you have

```js
if (loading) {
    return (...)
}
```

then the loading spinner will show, whilst the network fetch is happening _even though `useQuery` fetches immediately from the cache_.

This makes the UX as if you had `{ fetchPolicy: 'network-only' }` and you completely lose the 'fast response' suggested by the docs.

This hook returns `loading` true **only if there is no cache**. Then Apollo handles the re-render once the network request updates the cache.

## Inspiration

This problem is perfectly explained in [apollographql/apollo-client #8669](https://github.com/apollographql/apollo-client/issues/8669), with the code for this from a [workaround comment by @puglyfe](https://github.com/apollographql/apollo-client/issues/8669#issuecomment-978012147). The impact of the very simple switch, turns a completely non-reactive app that shows a loading spinner on every page load, to being the reactive app you expect, that loads once and then is instantaneous.

There's practically no code here, but it was such a jaw dropping moment for me to finally see React + Apollo cache working correctly that I wish Apollo did this by default. There is a reasonable explantion in the issue above why they don't, but I think its worth spreading this to get my sanity back for dealing with Apollo caching.
