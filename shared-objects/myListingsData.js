module.exports = {

	url: 'https://v2-staging.proxiopro.com/',
	showcaseUrl: 'http://showcase-staging.com/',

	elements: {
		searchForPropertiesMenu: '#menu-item-163 a',
    	myListingsTab: 'a[href="#my-listings"]',
		upgradeButton: '.card-listing:nth-child(1) .upgrade-listing button',
        chooseThisPlanButton: '#purchase .product-box button.purchase-next',
        checkoutButton: '#purchase .purchase-form button.btn-checkout',
        firstName: '#payment-method input[placeholder="First Name"]',
        lastName: '#payment-method input[placeholder="Last Name"]',
        cardNumber: '#payment-method input[placeholder="Card Number"]',
        cvv: '#payment-method input[placeholder="CVV"]',
        month: '#payment-method input[placeholder="MM"]',
        year: '#payment-method input[placeholder="YYYY"]',
        addressLine1: '#payment-method input[placeholder="Address Line 1"]',
        addressLine2: '#payment-method input[placeholder="Address Line 2"]',
        city: '#payment-method input[placeholder="City"]',
        state: '#payment-method input[placeholder="State"]',
        country: '#payment-method input[placeholder="Country"]',
        postCode: '#payment-method input[placeholder="Post Code"]',
        confirmButton: '#purchase button[type="submit"]',
        purchaseSuccessAlert: '#purchase-success div',
        closePurchaseModal: '#purchase button[data-dismiss="modal"]',
        showcasedItem: 'a[data-card-title="Miami"]:nth-child(3)'
	},

	paymentInfo: {
		firstName: 'Ricardo',
		lastName: 'Rodriguez',
		cardNumber: '4929751548951241',
		cvv: '311',
		month: '10',
		year: '2020',
		addressline1: 'Av Contorno 1000',
		addressLine2: 'apt 83',
		city: 'Belo Horizonte',
		state: 'MG',
		country: 'Brazil',
		postCode: '30350130'
	}
};
