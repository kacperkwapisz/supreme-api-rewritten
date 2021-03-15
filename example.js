var supreme = require('./index') || require('supreme-api-rewritten');

// Find Product Based on Keywords
const keywords = "Reversible Puffy Jacket";
const style = 'Blue';
const category = 'jackets';

// supreme.seek(category, keywords, style, (product, err) => {
//     if (err) {
//         console.log(err);
//         return err;
//     }
//     console.log(product);
// });


// supreme.getItems('all', (product, err) => {
//     if (err) {
//         console.log(err);
//         return err;
//     }
//     console.log(product);
// });

supreme.getItem('https://www.supremenewyork.com/shop/accessories/fuwjy1dpx/td2bm3ev8', (item, err) => {
     if (err) {
         console.log(err);
         return err;
     }
     console.log(item);
});
