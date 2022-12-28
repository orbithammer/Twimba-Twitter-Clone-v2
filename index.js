import { tweetsDatabase } from './data.js'
import { v4 as uuidv4 } from 'https://jspm.dev/uuid';

const tweetInputWrapper = document.getElementById("tweet-input-wrapper")
const focusReturn = document.getElementById("focus-return")
const gottenSavedTweetsData = JSON.parse(localStorage.getItem("savedTweetsData"))

let tweetHistory = [undefined]
let isFocused = false
let tweetsData = []

// console.log(`tweetsDatabase: `, tweetsDatabase)
// console.log(`gottenSavedTweetsData: `, gottenSavedTweetsData)

if(gottenSavedTweetsData) {
    // console.log("retrieving save data")
    tweetsData = gottenSavedTweetsData
} else {
    // console.log("using database")
    tweetsData = tweetsDatabase
}
// console.log(`tweetsData: `,tweetsData)

document.addEventListener('click', function(e){
    if(e.target.dataset.like){
       handleLikeClick(e.target.dataset.like) 
    }
    else if(e.target.dataset.retweet){
        handleRetweetClick(e.target.dataset.retweet)
    }
    else if(e.target.dataset.replies){
        handleRepliesClick(e.target.dataset.replies)
    }
    else if(e.target.dataset.focus) {
        handleFocusClick(e.target.dataset.focus)
    }
    else if(e.target.dataset.delete){
        handleDeleteClick(e.target.dataset.delete)
    }
    else if(e.target.id === 'tweet-btn'){
        handleTweetBtnClick()
    }
    else if(e.target.id === "back-arrow"){
        handleBackBtnClick()
    }
    else if(e.target.dataset.reply){
        handleReplyBtnClick(e.target.dataset.reply)
    }
    else if(e.target.id === "logo"){
        handleClearBtnClick()
    }
    else if(e.target) {
        // console.log(`e.target: `, e.target)
    }
})

function saveTweetsData(){
    localStorage.setItem("savedTweetsData", JSON.stringify(tweetsData))
}
 
function handleLikeClick(tweetId){ 
    const targetTweetObj = tweetsData.filter(function(tweet){
        return tweet.uuid === tweetId
    })[0]

    if (targetTweetObj.isLiked){
        targetTweetObj.likes--
    }
    else{
        targetTweetObj.likes++ 
    }
    targetTweetObj.isLiked = !targetTweetObj.isLiked
    render()
}

function handleRetweetClick(tweetId){
    const targetTweetObj = tweetsData.filter(function(tweet){
        return tweet.uuid === tweetId
    })[0]
    
    if(targetTweetObj.isRetweeted){
        targetTweetObj.retweets--
    }
    else{
        targetTweetObj.retweets++
    }
    targetTweetObj.isRetweeted = !targetTweetObj.isRetweeted
    render() 
}

function handleRepliesClick(replyId){
    document.getElementById(`replies-${replyId}`).classList.toggle('hidden')
}

function handleFocusClick(replyId){
    if(isFocused){
        if(tweetHistory[0] != replyId) tweetHistory.unshift(replyId)
    }
    
    // console.log(`tweetHistory: `,tweetHistory)
    render(replyId)
    document.getElementById(`replies-${replyId}`).classList.remove('hidden')
}

function handleDeleteClick(replyId){
    const deleteTweetIndex = tweetsData.findIndex(tweet => tweet.uuid === replyId)
    // console.log(`deleteTweetIndex`, deleteTweetIndex)
    tweetsData.splice(deleteTweetIndex, 1)
    saveTweetsData()
    render()
}

function handleTweetBtnClick(){
    const tweetInput = document.getElementById('tweet-input')

    if(tweetInput.value){
        tweetsData.unshift({
            handle: `@Scrimba`,
            profilePic: `images/scrimbalogo.png`,
            likes: 0,
            retweets: 0,
            tweetText: tweetInput.value,
            replies: [],
            isLiked: false,
            isRetweeted: false,
            uuid: uuidv4()
        })
    render()
    tweetInput.value = ''
    }
}

function handleBackBtnClick(){
    render(tweetHistory[1])
    tweetHistory.shift()
}

function handleReplyBtnClick(replyId){
    const replyInput = document.getElementById(`reply-input-${replyId}`)
    // console.log(`replyInput: `,replyInput)
    
    if(replyInput.value) {
        const tweetsDataIndex = tweetsData.findIndex(tweet => tweet.uuid === replyId)
        // console.log(`tweetsDataIndex: `,tweetsDataIndex)
        tweetsData[tweetsDataIndex].replies.unshift({
            handle: `@Scrimba`,
            profilePic: `images/scrimbalogo.png`,
            tweetText: `${replyInput.value}`
        })
        render(replyId)
        document.getElementById(`replies-${replyId}`).classList.remove('hidden')
    }
}

function handleClearBtnClick(){
    // console.log("clearing save data")
    localStorage.clear()
    // render()
}

function getFeedHtml(topTweetUuid){
    
    saveTweetsData()
    
    let tweetsFeedData = []
    let replyTweet = ``
    
    if(topTweetUuid) {
        let topTweetIndex = tweetsData.findIndex(tweet=>tweet.uuid === topTweetUuid)
        tweetsFeedData[0] = tweetsData[topTweetIndex]
        isFocused = true
        focusReturn.innerHTML = `<i class="fa-solid fa-arrow-left black" id="back-arrow"></i>`
        replyTweet = `
        <div class="reply-container">
            <img src="images/scrimbalogo.png" class="profile-pic">
            <textarea placeholder="Tweet your reply" class="reply-input" id="reply-input-${topTweetUuid}"></textarea>
            <button class="reply-btn" data-reply="${topTweetUuid}">Reply</button>
        </div>
        `
    } else {
        tweetsFeedData = tweetsData
        isFocused = false
        focusReturn.innerHTML = ``
    }
    
    // console.log(`tweetsFeedData: `, tweetsFeedData)
    
    let feedHtml = ``
    
    tweetsFeedData.forEach(function(tweet){
        
        let likeIconClass = ''
        
        if (tweet.isLiked){
            likeIconClass = 'liked'
        }
        
        let retweetIconClass = ''
        
        if (tweet.isRetweeted){
            retweetIconClass = 'retweeted'
        }
        
        if(isFocused) {
            tweetInputWrapper.innerHTML = ""
        } else {
            tweetInputWrapper.innerHTML = `
            <div class="tweet-input-area">
                <img src="images/scrimbalogo.png" class="profile-pic">
                <textarea placeholder="What's happening?" id="tweet-input"></textarea>
            </div>
            <button id="tweet-btn">Tweet</button>
            `
        }
        
        let repliesHtml = ''
              
        if(tweet.replies.length > 0){
            tweet.replies.forEach(function(reply){
                repliesHtml+=`
                <div class="tweet-reply">
                    <div class="tweet-highlight">
                        <div class="tweet-inner">
                            <img src="${reply.profilePic}" class="profile-pic">
                                <div>
                                    <p class="handle">${reply.handle}</p>
                                    <p class="tweet-text">${reply.tweetText}</p>
                                </div>
                        </div>
                    </div>
                </div>
                `
            })
        }
        
          
        feedHtml += `
        <div class="tweet">
            <div class="tweet-highlight">
                <div class="tweet-inner" data-focus=${tweet.uuid}>
                    <img src="${tweet.profilePic}" class="profile-pic" data-focus=${tweet.uuid}>
                    <div>
                        <p class="handle" data-focus=${tweet.uuid}>${tweet.handle}</p>
                        <p class="tweet-text" data-focus=${tweet.uuid}>${tweet.tweetText}</p>
                        <div class="tweet-details">
                            <span class="tweet-detail">
                                <i class="fa-regular fa-comment-dots"
                                data-replies="${tweet.uuid}"
                                ></i>
                                ${tweet.replies.length}
                            </span>
                            <span class="tweet-detail">
                                <i class="fa-solid fa-heart ${likeIconClass}"
                                data-like="${tweet.uuid}"
                                ></i>
                                ${tweet.likes}
                            </span>
                            <span class="tweet-detail">
                                <i class="fa-solid fa-retweet ${retweetIconClass}"
                                data-retweet="${tweet.uuid}"
                                ></i>
                                ${tweet.retweets}
                            </span>
                            <span class="tweet-detail">
                                <i class="fa-solid fa-trash-can"
                                data-delete="${tweet.uuid}"
                                ></i>
                            </span>
                        </div>   
                    </div>            
                </div>
            </div>
            <div>
                ${replyTweet}
            </div>
            <div class="hidden" id="replies-${tweet.uuid}">
                ${repliesHtml}
            </div>   
        </div>
        `
   })
   return feedHtml 
}

function render(topTweetUuid){
    document.getElementById('feed').innerHTML = getFeedHtml(topTweetUuid)
}

render()

