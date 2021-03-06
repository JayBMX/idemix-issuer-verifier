/*
    Copyright 2015 IBM Corp. All Rights Reserved
    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
*/

var express = require('express'),
	router = express.Router(),
	serviceIssuance = require("../js_modules/service-issuance.js"),
	addressBook = require("../js_modules/address-book.js"),
	util = require('util');

// Request to Crypto service to store credentail policy data
// and get back link to this data for wallet
router.get('/service/issuance', function(req, res) {

	// Get Policy ID from request parameters
	var policyId = req.query.id;

	// Collect attributes that came from the issuance form from UI
	var attrs = req.query.attrs;

	if(policyId === undefined || attrs === undefined) {
		res.status(500).send('Policy ID or issuance attribute was not properly provided');
		return;
	}

	// Generate success callback url for mobile wallet (Web wallet uses postMessage instead)
	var issuer_success_callback_url =
		req.protocol + '://' + req.get('host') + "/issuance/success";

	// Generate fail callback url for mobile wallet
	var issuer_fail_callback_url =
		req.protocol + '://' + req.get('host') + "/issuance/fail";

	// Call the service. For more inforamtion about this call
	// see js_modules/service-issuance.js
	serviceIssuance.serviceIssuance(
		policyId,
		attrs,
		encodeURIComponent(issuer_success_callback_url),
		encodeURIComponent(issuer_fail_callback_url),
		function (error, result, code) {
			if(error !== null){
				res.status(500).send(error);
			} else {
				res.status(code).send(result);
			}
		});
});

// Show success result page for mobile wallet
router.get('/issuance/success', function(req, res) {
	res.render('result', {result: 'success'});
});

// Show fail result page for mobile wallet
router.get('/issuance/fail', function(req, res) {
	res.render('result', {result: 'fail'});
});

// Show issuance UI form page. Data attributes collected from this form
// will be passed to the 'service/issuance' route (see above).
router.get('/issuanceform/voucher', function(req, res){
	var form_data = {
		base_url_service: addressBook.getCryptoServiceDetails().url,
		base_url_credentialwallet: addressBook.getCredentialWalletUrl(),
	};
	res.render('voucher', form_data);
});

module.exports = router;
