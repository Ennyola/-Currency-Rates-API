const express = require('express');
const fetch = require("node-fetch");
const Joi = require('joi');


const app = express();


const schema = Joi.object({
    base: Joi.string().length(3).required(),
    currency: Joi.string().required()
})

const currencies = ["CAD", "HKD", "ISK", "PHP", "DKK", "HUF", "CZK", "AUD", "RON", "SEK", "IDR", "INR", "BRL", "RUB", "HRK", "JPY", "THB", "CHF", "SGD",
    "PLN", "BGN", "TRY", "CNY", "NOK", "NZD", "ZAR", "USD", "MXN", "ILS", "GBP", "KRW", "MYR", "EUR"
]


app.get("/", (req, res) => {
    res.send("hello")
})

app.get("/api/rates", (req, res) => {
    const { base, currency } = req.query
    const { error } = schema.validate(req.query)
    if (!base) {
        return res.status(400).json("Please enter a base currency in your query");

    }
    if (!currency) {
        return res.status(400).json("Please Include currency query string");

    }
    const currencyList = currency.split(",")



    if (error) return res.status(400).json(error.details[0].message)
    if (!currencies.includes(base)) return res.status(400).json("Please Select a valid base currency in your query")

    for (letter of currency) {
        if (letter !== letter.toUpperCase()) return res.status(400).json("All currency query string must be in UpperCase")
    }
    for (letter of base) {
        if (letter !== letter.toUpperCase()) return res.status(400).json("All base currency characters must be in UpperCase")
    }
    for (singleCurrency of currencyList) {
        if (base === "EUR" && singleCurrency === base) {
            return res.status(400).json("Rates are quoted against the Euro by default. Please do not include EUR in both base and currency in the same query")
        }
        if (!currencies.includes(singleCurrency)) {
            return res.status(400).send("Please make sure your currency query string is correct. \nHints: Make sure the currencies are correct, No extra white space and the commas are appropriate");
        }
    }


    fetch(`https://api.exchangeratesapi.io/latest?base=${base}&symbols=${currency}`)
        .then(response => response.json())
        .then((data) => {
            res.json({
                results: {
                    ...data
                }
            })
        })
        .catch((err) => res.status(400).send(err.message))
})

const port = process.env.PORT || 4000
app.listen(port, () => {
    console.log(`istening on port ${port}`)
})