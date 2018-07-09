const listingData = require('./listingsData');

module.exports = {
	// Persona data.
	Ricardo: {
		Email: 'ricardorodriguez@123realstate.com',
        Password: 'px1234',
        License: '665589',
        OfficeName: '123 Real State, Inc',
        OfficeAddress: 'Miami, Florida',
        country: 'us',
        LocationText: 'Miami, Florida',
        EntityType: 'agent',
        Status: 'active',
        Name: 'Ricardo Rodriguez',
        Country: 'us',
        Licenses: [{LicenseNumber: '665589', Country: 'us'}],
        CustomFields:{
            pxpv2: {
                office_name: '123 Real State, Inc',
                office_address: 'Miami, Florida'
            },
		},
		Listings: [
			listingData.miami,
			listingData.miamiBeach,
		],
	},
};
