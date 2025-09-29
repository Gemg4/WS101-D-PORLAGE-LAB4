// Auction Bidding System 


let bidderList = []

// Create Bidder Object
function createbidder(bidder) {
    const obj = {}
    obj.name = bidder.name
    obj.item = bidder.item
    obj.amount = bidder.amount
    obj.item = bidder.time
    return obj
}


// Find the highest bid for each item
function findHighestBid(bidderList) {
    highestBidItems = []

}

// Filter bidder by its attributes
function filterBid(toFilter) {
    bidderList.filter((element) => {
        return element.toFilter == toFilter
    })
}

// Calculate total bids for a specific item
function totalBids(bidder) {
    item = bidder.item
    bidderList.forEach(element => {
        
    });
}

// Asynchronous call to fetch bidders 
async function fetchBidders() {
    const response = await fetch("bidders.json")
    const data = await response.text()
    return JSON.parse(data)
}

const dataFetch = async () => {
    const data = await fetchBidders()
    data.bidder.forEach(element => {
        bidderList.push(element)
    })
}

console.log(bidderList);

