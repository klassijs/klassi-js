module.exports = {

	url: 'https://v2-staging.proxiopro.com/',

    elements: {
        myAccountDropdown: '#dropdown-user a',
	    logoutButton: '.pad-all a',
	    loginUsernameField: '#username',
	    loginPasswordField: '#password',
	    signInButton: 'button[value="Login"]',
	    navbar: '.navbar-content',
	    mainNavBar: '#mainnav-menu'
	},

	userData: {
        Email: 'ricardorodriguez@12345realstate.com',
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
	},

	listingsData: [
		{
			EntityType:"Resale",
			PriceType:"Default",
			Status:"Active",
			IsExclusive:"false",
			IsForeclosure:"false",
			IsFeatured:"false",
			HideAddress:"false",
			Amenities:[],
			PrivacyLevel:"Public",
			Address:"Miami",
			RefNumber:"88750033",
			country:"us",
			LocationText:"Miami, Florida",
			Currency:"USD",
			Price:2450000,
			ContractType:"Sale",
			Types:["Other"],
			BuiltArea:{"Value":"3500","Unit":"squarefoot"},
			Headlines:[{"Language":"en","Value":"Miami Luxury House","Default":"true"}],
			Descriptions:[{"Language":"en","Value":"Call me right now.","Default":"true"}],
			LatLong:[25.7616798,-80.1917902]
		},
		{
			EntityType:"Resale",
			PriceType:"Default",
			Status:"Active",
			IsExclusive:"false",
			IsForeclosure:"false",
			IsFeatured:"false",
			HideAddress:"false",
			Amenities:[],
			PrivacyLevel:"Public",
			Address:"Miami Beach",
			RefNumber:"990033221",
			country:"us",
			LocationText:"Miami Beach, Florida",
			Currency:"USD",
			Price:850000,
			ContractType:"Sale",
			Types:["Other"],
			BuiltArea:{"Value":"3500","Unit":"squarefoot"},
			Headlines:[{"Language":"en","Value":"Miami Beach house","Default":"true"}],
			Descriptions:[{"Language":"en","Value":"Visit this property.","Default":"true"}],
			LatLong:[25.790654,-80.1300455]
		}
	],
};
