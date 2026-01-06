const likeButtons = document.querySelectorAll('.ri-heart-3-line');
let isLiked = false;

likeButtons.forEach((likeButton)=>{
    likeButton.addEventListener("click",()=>{
        if(!isLiked){   
            likeButton.style.color = "red";
            isLiked = true;
        }
        else{
            likeButton.style.color = "white";
            isLiked = false;
        }
    })
})