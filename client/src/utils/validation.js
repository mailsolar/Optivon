export const validateOrder = (orderType, entryPrice, stopLoss, takeProfit) => {
    const errors = [];

    // Convert to numbers
    const entry = parseFloat(entryPrice);
    const sl = stopLoss ? parseFloat(stopLoss) : null;
    const tp = takeProfit ? parseFloat(takeProfit) : null;

    if (!entry || isNaN(entry)) {
        return { isValid: false, errors: ['Invalid Entry Price'] };
    }

    if (orderType === 'BUY' || orderType === 'LONG' || orderType === 'buy') {
        // For buy orders
        if (sl && sl >= entry) {
            errors.push('Stop Loss must be BELOW entry price for BUY orders');
        }
        if (tp && tp <= entry) {
            errors.push('Take Profit must be ABOVE entry price for BUY orders');
        }
    } else if (orderType === 'SELL' || orderType === 'SHORT' || orderType === 'sell') {
        // For sell orders
        if (sl && sl <= entry) {
            errors.push('Stop Loss must be ABOVE entry price for SELL orders');
        }
        if (tp && tp >= entry) {
            errors.push('Take Profit must be BELOW entry price for SELL orders');
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

export const calculateSLTP = (orderType, entryPrice, slPercent, tpPercent) => {
    let stopLoss = null;
    let takeProfit = null;
    const price = parseFloat(entryPrice);

    if (slPercent && parseFloat(slPercent) > 0) {
        if (orderType === 'BUY' || orderType === 'LONG' || orderType === 'buy') {
            stopLoss = price * (1 - parseFloat(slPercent) / 100);
        } else {
            stopLoss = price * (1 + parseFloat(slPercent) / 100);
        }
    }

    if (tpPercent && parseFloat(tpPercent) > 0) {
        if (orderType === 'BUY' || orderType === 'LONG' || orderType === 'buy') {
            takeProfit = price * (1 + parseFloat(tpPercent) / 100);
        } else {
            takeProfit = price * (1 - parseFloat(tpPercent) / 100);
        }
    }

    return {
        stopLoss: stopLoss ? parseFloat(stopLoss.toFixed(2)) : null,
        takeProfit: takeProfit ? parseFloat(takeProfit.toFixed(2)) : null
    };
};

