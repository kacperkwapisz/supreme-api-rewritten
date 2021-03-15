var cheerio = require('cheerio');
const axios = require('axios');

var api = {};

api.url = 'https://www.supremenewyork.com';

String.prototype.capitalizeEachWord = function() {
    return this.replace(/\w\S*/g, function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

async function discord_webhook(webhook, item) {
    if(webhook === ''){
        return "No webhook specified";
    }
    let data = {};
    data["username"] = "Supreme Monitor";
    data["avatar_url"] = "https://lh3.googleusercontent.com/lPUZwKE_VV6_UxQOE_MlXVSYi77LssHVK0T9zZFFERORHI7ZhQXD-WvsMKXu5822NQ";
    data["embeds"] = [];
    let embed = {};
    if (item !== '') {
        embed["title"] = item.title;
        embed["fields"] = [{'name': 'Color', 'value': item.style}];
        embed["url"] = item.link;
        embed["thumbnail"] = {'url': item.image};
    } else {
        embed["description"] = "Thank you for using Supreme API Rewritten. This message is to let you know that everything is working fine! Want to make a contribution? Fork the repo, add your changes, and submit a pull request. Any type of contributions (ideas, bug fixes, fixing typos, etc.) will be appreciated! https://github.com/kacperkwapisz/supreme-api-rewritten";
    }
    embed["color"] = 12845619;
    embed["footer"] = {'text': 'Made by Kacper Kwapisz'};
    embed["timestamp"] = new Date().toISOString().replace(/T/, ' ').replace(/Z/, '');
    data["embeds"] = [embed];

    const config = {
        method: "POST",
        data: JSON.stringify(data),
        headers: {"Content-Type": "application/json"}
    };
    try {
        axios(webhook, config)
            .then(res => {
                return "Payload delivered successfully, code "+res.status+".";
            });
    } catch (error) {
        return error;
    }
}

// getItem('all')
// other options: new, jackets, shirts, tops_sweaters, sweatshirts,
// pants, hats, bags, accessories, shoes, skate

/**
 * Checks for items under desired category
 *
 * @param  {String} category
 * @return {Array}
 */

api.getItems = function(category, callback) {

    var getURL = api.url + '/shop/all/' + category;
    if (category === 'all') {
        getURL = api.url + '/shop/all';
    } else if (category === 'new') {
        getURL = api.url + '/shop/new';
    }

    axios({method: 'GET', headers: { 'accept': 'text/html' }, url: getURL})
        .then(function (response) {
            var $ = cheerio.load(response.data);
            var count = $('img').length;

            if ($('.shop-closed').length > 0) {
                return callback(null, 'Store Closed');
            } else if (count === 0) {
                return callback(null, `No items found in '${category}'`);
            }

            var parsedResults = [];


            // console.log(len);
            $('img').each(function(i, element) {

                var nextElement = $(this).next();
                var prevElement = $(this).prev();
                var image = "https://" + $(this).attr('src').substring(2);
                var title = $(this).attr('alt');
                var availability = nextElement.text().capitalizeEachWord();
                var link = api.url + this.parent.attribs.href;
                var sizesAvailable;


                if (availability == "") availability = "Available";

                axios({method: 'GET', headers: { 'accept': 'text/html' }, url: link})
                    .then(function (response) {
                        var $ = cheerio.load(response.data);

                        var addCartURL = api.url + $('form[id="cart-addf"]').attr('action');

                        var soldOut = $('b[class="button sold-out"]').eq(0);
                        if (availability == "Sold Out") {
                            addCartURL = null;
                        }

                        var sizeOptionsAvailable = [];
                        if ($('option')) {
                            $('option').each(function(i, elem) {
                                var size = {
                                    id: parseInt($(this).attr('value')),
                                    size: $(this).text().trim(),
                                }
                                sizeOptionsAvailable.push(size);
                            });

                            if (sizeOptionsAvailable.length > 0) {
                                sizesAvailable = sizeOptionsAvailable
                            } else {
                                sizesAvailable = null
                            }
                        } else {
                            sizesAvailable = null;
                        }

                        var metadata = {
                            title: $('h1').attr('itemprop', 'name').eq(1).html().trim(),
                            style: $('.style').attr('itemprop', 'model').text().trim(),
                            link: link,
                            description: $('.description').text().trim(),
                            addCartURL: addCartURL,
                            price: $('span[itemprop="price"]').eq(0).text().trim(),
                            image: image,
                            sizesAvailable: sizesAvailable,
                            images: [],
                            availability: availability
                        };

                        // Some items don't have extra images (like some of the skateboards)
                        if ($('.styles').length > 0) {
                            var styles = $('.styles')[0].children;
                            for (li in styles) {
                                for (a in styles[li].children) {
                                    if (styles[li].children[a].attribs['data-style-name'] == metadata.style) {
                                        metadata.images.push('https:' + JSON.parse(styles[li].children[a].attribs['data-images']).zoomed_url)
                                    }
                                }
                            }
                        } else if (title.indexOf('Skateboard') != -1) {
                            // Because fuck skateboards
                            metadata.images.push('https:' + $('#img-main').attr('src'))
                        }

                        parsedResults.push(metadata);

                        if (!--count) {
                            callback(parsedResults, null);
                        }
                    })
                    .catch(function (error) {
                        return callback(null, 'No response from website');
                    });

            });
        })
        .catch(function (error) {
            // handle error
            console.log(error)
            return callback(null, 'No response from website');
        });
};

/**
 * Checks for item under desired url
 *
 * @param  {String} itemURL
 * @return {Array}
 */

api.getItem = function(itemURL, callback) {
    axios({method: 'GET', headers: { 'accept': 'text/html' }, url: itemURL})
        .then(function (response) {
            var $ = cheerio.load(response.data);
            var sizeOptionsAvailable = [];
            if ($('option')) {
                $('option').each(function(i, elem) {
                    var size = {
                        id: parseInt($(this).attr('value')),
                        size: $(this).text().trim(),
                    }
                    sizeOptionsAvailable.push(size);
                });

                if (sizeOptionsAvailable.length > 0) {
                    sizesAvailable = sizeOptionsAvailable
                } else {
                    sizesAvailable = null
                }
            } else {
                sizesAvailable = null;
            }

            var availability;
            var addCartURL = api.url + $('form[id="cart-addf"]').attr('action');

            var soldOut = $('b[class="button sold-out"]').eq(0);
            if (soldOut.text() === "") {
                availability = 'Available'
            } else {
                availability = 'Sold Out'
                addCartURL = null
            }

            var metadata = {
                title: $('h1').attr('itemprop', 'name').eq(1).html().trim(),
                style: $('.style').attr('itemprop', 'model').text().trim(),
                link: itemURL,
                description: $('.description').text().trim(),
                addCartURL: addCartURL,
                price: $('span[itemprop="price"]').eq(0).text().trim(),
                image: 'http:' + $('#img-main').attr('src'),
                sizesAvailable: sizesAvailable,
                images: [],
                availability: availability
            };

            // Some items don't have extra images (like some of the skateboards)
            if ($('.styles').length > 0) {
                var styles = $('.styles')[0].children;
                for (li in styles) {
                    for (a in styles[li].children) {
                        if (styles[li].children[a].attribs['data-style-name'] == metadata.style) {
                            metadata.images.push('https:' + JSON.parse(styles[li].children[a].attribs['data-images']).zoomed_url)
                        }
                    }
                }
            } else if (title.indexOf('Skateboard') != -1) {
                metadata.images.push('https:' + $('#img-main').attr('src'))
            }

            callback(metadata, null);
        })
        .catch(function (error) {
            // handle error
            return callback(null, 'No response from website');
        });
};

api.watchOnAllItems = [];
api.watchAllItems = function(interval, category, callback) {
    api.log('Now watching for all items');
    api.watchOnAllItems = setInterval(function() {
        api.getItems(category, function(items) {
            callback(items, null);
        });
    }, 1000 * interval); // Every xx sec
}

api.stopWatchingAllItems = function(callback) {
    clearInterval(api.watchOnAllItems);
    if (api.watchOnAllItems == "") {
        callback(null, 'No watching processes found.');
    } else {
        callback('Watching has stopped.', null);
    }
}

// searches for new item drop TODO
/*api.onNewItem = function(discordwebhookurl, interval, callback) {
    discord_webhook(discordwebhookurl, "");
    api.watchAllItems(interval, "new", (item, err) => {
        if (err) {
             console.log(err);
             api.stopWatchingAllItems();
            return callback(null, err);
        }
        if(item) {
            discord_webhook(discordwebhookurl, item)
                .then(function (response) {
                    callback(item.title+" now dropped!", null);
                })
                .catch(function (error) {
                    callback(error);
                })
        }
    });
}*/

/**
 * Seeks for items on desired category page with specific keywords/styles.
 * @param  {String} category
 * @param  {String} category
 * @param keywords
 * @param styleSelection
 * @param callback
 * @return {Object}
 */
api.seek = function(category, keywords, styleSelection, callback) {
    var productLink = [];
    api.getItems(category, (product, err) => {

        if (err) {
            return callback(null, 'Error occured while trying to seek for items.');
        }
        for (i = 0; i < product.length; i++) {
            var title = product[i].title;
            var style = product[i].style;

            if (style === null) {
                // type - style not defined without a match
                if (title.indexOf(keywords) > -1) { // check if the keywords match with the title
                    // found item
                    productLink.push(product[i].link);
                    return callback(product[i], null);
                    break;
                } else {
                    continue;
                }
            } else if (style.indexOf(styleSelection) > -1) {
                // type - style defined with match
                if (title.indexOf(keywords) > -1) { // check if the keywords match with the title
                    // found item
                    productLink.push(product[i].link);
                    return callback(product[i], null);
                    break;
                } else {
                    continue;
                }
            }
        }

        if (productLink[0] === undefined) {
            return callback(null, "Could not find any results matching your keywords.");
        }

    });
}

api.log = function(message) {
    console.log('[supreme api rewritten] ' + message);
}

module.exports = api;
