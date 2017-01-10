module.exports = {

    url: 'http://klassifashion.com',

    cssImage: {
        name: 'homePage', elem: ''
    },

    elements: {
        productId: '#center_column > ul > li.ajax_block_product.col-xs-12.col-sm-6.col-md-4.last-line.last-item-of-tablet-line.last-mobile-line > div > div.left-block',
        productItem: '#center_column > ul > li.ajax_block_product.col-xs-12.col-sm-6.col-md-4.last-line.last-item-of-tablet-line.last-mobile-line > div > div.right-block > div.button-container > a.button.lnk_view.btn.btn-default > span'
    },

    hoverAndClick: {
        name: 'Bikini',
        menuItem: '#block_top_menu > ul > li:nth-child(2)',
        menuItemII: '#block_top_menu > ul > li:nth-child(2) > ul > li:nth-child(2) > ul > li:nth-child(1) > a'
    },


    mouseOverNavItem: function(containingText) {

        return helpers.clickHiddenElement(page.klassiFashion.hoverAndClick.menuItem, containingText).pause(200).then(function(){
            return driver.click(page.klassiFashion.hoverAndClick.menuItemII)
        })
    },

    clickProductItem: function(containingText) {

        return helpers.clickHiddenElement(page.klassiFashion.elements.productId, containingText).pause(200).then(function(){
            return driver.click(page.klassiFashion.elements.productItem, containingText)
        })
    },

    titleContains: function(expectedTitle) {

        return driver.getTitle(function(pageTitle) {
            expect(pageTitle).to.contain(expectedTitle);
        });
    }

};