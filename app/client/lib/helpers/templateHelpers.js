/**
Helper functions

@module Helpers
**/

/**
Global template helpers

@class TemplateHelpers
@constructor
**/

/**
A simple template helper to log objects in the console.

@method (debug)
**/
Template.registerHelper('debug', function(object){
    console.log(object);
});



/**
Formats a timestamp to any format given.

    {{formatTime myTime "YYYY-MM-DD"}}

@method (formatTime)
@param {String} time         The timstamp, can be string or unix format
@param {String} format       the format string, can also be "iso", to format to ISO string, or "fromnow"
//@param {Boolean} realTime    Whether or not this helper should re-run every 10s
@return {String} The formated time
**/
Template.registerHelper('formatTime', Helpers.formatTime);


/**
Formats a number.

    {{formatNumber myNumber "0,0.0[0000]"}}

@method (formatNumber)
@param {String} number
@param {String} format       the format string
@return {String} The formatted number
**/
Template.registerHelper('formatNumber', function(number, format){
    if(format instanceof Spacebars.kw)
        format = null;

    if(number instanceof BigNumber)
        number = number.toNumber();

    format = format || '0,0.0[0000]';


    if(!_.isFinite(number))
        number = numeral().unformat(number);

    if(_.isFinite(number))
        return numeral(number).format(format);
});

/**
Convert Wei to Ether Values

@method (toEth)
*/
Template.registerHelper('toEth', function(wei) {
	if (wei) {
		if ((typeof wei) == 'string') wei = new BigNumber(wei);
		var unit = LocalStore.get('etherUnit');
		
		return web3.fromWei(wei, unit).toPrecision(8) + ' ' + unit;
	} else {
		return '?';
	}
});

Template.registerHelper('iff', function(cond, tt, ff) {
		return cond ? tt : ff;
});

Template.registerHelper('regName', function(addr) {
	return RoInst().reg_cache.regName(addr);
});

Template.registerHelper('regAddr', function(name) {
	return RoInst().reg_cache.regAddr(name);
});
