# Supreme API Rewritten
## A NodeJS API for [supremenewyork.com](http://www.supremenewyork.com/)

[![NPM](https://nodei.co/npm/supreme-api-rewritten.png)](https://npmjs.org/package/supreme-api-rewritten)

This Supreme API is a rewritten version of the original Supreme API made by [dzt](https://github.com/dzt), available [here](https://github.com/dzt/supreme-api).
The original API has not been updated for 5 years now so I thought I would maintain it on my own.

### How to install
```npm install supreme-api-rewritten --save```

Check out the [docs](https://github.com/kacperkwapisz/supreme-api-rewritten/wiki/Docs)!

### Usage
```javascript
const supreme = require('supreme-api-rewritten');

supreme.getItems('all', (items, err) => {
    if (err) {
        console.log(err);
        return err;
    }
    console.log(items);
});

supreme.getItem('http://www.supremenewyork.com/shop/jackets/fman5r0xy/aw5dopam2', (item, err) => {
    if (err) {
        console.log(err);
        return err;
    }
    console.log(item);
});

// check every 5 seconds
supreme.watchAllItems(5, 'shoes', (items, err) => {
    if (err) {
        console.log(err);
        return err;
    }
    console.log(items);
});

// Cancel Item watch
supreme.stopWatchingAllItems((status, err) => {
    if (err) {
        console.log(err);
        return err;
    }
    console.log(status);
});

// Look for a new item every 5 seconds
supreme.onNewItem(5, (product, err) => {
    if (err) {
        console.log(err);
        return err;
    }
    console.log('New Release: ' + item.name);
});

// Find items based on specific keywords

const category = 'jackets';
const keywords = "UNDERCOVER";
const style = 'Burgundy';

supreme.seek(category, keywords, style, (product, err) => {
    if (err) {
        console.log(err);
        return err;
    }
    console.log(product);
    console.log(product.title); // example => Supreme®/UNDERCOVER Wool Overcoat
});

```

### Features
* [x] Check for items under desired category
* [x] Check for item under desired url
* [x] Seek for items on desired category page with specific keywords/styles.
* [ ] Watch and seek for changes on individual items. (Coming Very Soon)
* [ ] Send new items to discord using webhook

### Update log
**v1.0.0** (15.03.2021)
* changed request library to axios as it's discontinued
* fix minor bugs according to changes in the supremenewyork.com site

## Contribution
Want to make a contribution? Fork the repo, add your changes, and submit a pull request. Any type of contributions (ideas, bug fixes, fixing typos, etc.) will be appreciated!


## License
supreme-api-rewritten is licensed under [MIT License](https://github.com/kacperkwapisz/supreme-api-rewritten/blob/master/LICENSE).
