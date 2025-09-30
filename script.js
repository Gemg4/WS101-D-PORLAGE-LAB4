// Auction Bidding System 
// Create Bidder Object
function createbidder(bidder) {
    const obj = {}
    obj.name = bidder.name
    obj.item = bidder.item
    obj.amount = bidder.amount
    obj.time = new Date().toISOString
    return obj
}

function setItemList(bidderList) {
    return [...new Set(bidderList.map(element => element.item))]
}

// Find the highest bid for each item
function findHighestBid(bidderList) {
    let listOfItemAndAmount = []
    let listOfItem = setItemList(bidderList)

    for (let i = 0; i < listOfItem.length; i++) {
        let listOfItemAmount = []
        for (let j = 0; j < bidderList.length; j++) {
            if (listOfItem[i] === bidderList[j].item) {
                listOfItemAmount.push(bidderList[j].amount)
            }
        }
        listOfItemAndAmount[i] = { [listOfItem[i]]: getArrayMax(listOfItemAmount) }
    }
    return listOfItemAndAmount
}

// Get max value in an array
function getArrayMax(array) {
    return array.reduce((acc, element) => (acc > element) ? acc : element, 0)
}



// Calculate total bids for a specific item
function calculateTotalBids(bidderList) {
    let listOfItemAndTotal = []
    let listOfItem = setItemList(bidderList)

    for (let i = 0; i < listOfItem.length; i++) {
        let listOfItemAmount = []
        for (let j = 0; j < bidderList.length; j++) {
            if (listOfItem[i] === bidderList[j].item) {
                listOfItemAmount.push(bidderList[j].amount)
            }
        }
        listOfItemAndTotal[i] = { [listOfItem[i]]: getArrayTotal(listOfItemAmount) }
    }
    return listOfItemAndTotal
    
}

function getArrayTotal(array) {
    return array.reduce((acc, element) => acc += element, 0)
}
// Filter bidder by its attributes
function filterBid(bidderList, filterBy) {
    return bidderList.map(element => element[filterBy])
}

// Group bids by item 
function groupBids(bidderList, groupBy) {
    let listOfItemAndGroupBy = []
    let listOfItem = setItemList(bidderList)

    for (let i = 0; i < listOfItem.length; i++) {
        let listOfItemGroup = []
        for (let j = 0; j < bidderList.length; j++) {
            if(listOfItem[i] === bidderList[j].item) {
                listOfItemGroup.push(bidderList[j][groupBy])
            }

        }
        listOfItemAndGroupBy.push({[listOfItem[i]]: listOfItemGroup})
    }
    return listOfItemAndGroupBy
}

// Asynchronous call to fetch bidders 
async function fetchBidders() {
    const response = await fetch("bidders.json")
    const data = await response.json()
    return data
}

const loadData = async () => {
    const temporaryList = []
    const data = await fetchBidders()
    data.bidder.forEach(element => {
        temporaryList.push(element)
    })
    return [...temporaryList]
}


async function main() {
    console.log(findHighestBid(await loadData()))
    console.log(calculateTotalBids(await loadData()));
    console.log(filterBid(await loadData(), "item"));
    console.log(groupBids(await loadData(), "amount"));
    
}

main()