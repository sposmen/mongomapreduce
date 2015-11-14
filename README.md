# This is a sample to compare mongodb map-reduce compared with NodeJS directly processes

1. Load data sample

## 1. Load data sample

### Steps

1. Download the data (described after...).
2. Execute `npm install` to install dependencies.
3. Find inside loadToMongoData.js the line `var url = 'mongodb://localhost:27017/mongomapreduce';` and change to your mongo server endpoint.
4. Execute `node loadToMongoData.js` 

### Download data from torrent

Download the data [here](http://academictorrents.com/details/9b13183dc4d60676b773c9e2cd6de5e5542cee9a) and un-compress the file

The directory structure must be similar to:

```
- /
  - /data
    - /training_set
      - mv_0000001.txt
      - mv_0000002.txt
      - mv_0000003.txt
      ...
    - movie_titles.txt
    - probe.txt
    ...
```
