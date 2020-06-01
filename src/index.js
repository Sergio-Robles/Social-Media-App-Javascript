document.addEventListener("DOMContentLoaded", () => {

    const picturesURL = "http://localhost:3000/pictures";
    const commentsURL = "http://localhost:3000/comments";

    const form = document.querySelector(".add-post-form")

    let commentsArr = [];

    form.addEventListener("submit", (event) => {
        event.preventDefault()

        const userName = event.target.name.value
        const imageUrl = event.target.image.value
        const newComment = event.target.comment.value

        fetch(picturesURL, {   
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json"
            },
            body: JSON.stringify({
                name: "@" + userName,
                image: imageUrl,
                comment: newComment,
                claps: 0
            }),
        }).then(resp => resp.json())
        .then( 
            renderPicture
        )

    })

    const getPictures = () => {
        return fetch(picturesURL)
        .then(response => response.json())
        .then(pictures => renderPictures(pictures))
    };

    const renderPictures = (pictures) => {
        pictures.forEach((picture) => renderPicture(picture));
    };

    const renderPicture = (picture) => {

        const postCollection = document.querySelector("#post-collection")
        const postCard = document.createElement("div")
        postCard.className = "item"

        const postUsername = document.createElement("h2")
        postUsername.innerText = picture.name

        const postPicture = document.createElement("img")
        postPicture.src = picture.image

        const divComment = document.createElement("div")
        divComment.className = "divComment"
        const postComment = document.createElement("h3")
        postComment.innerText = picture.comment


        const replyButton = document.createElement("button")
        replyButton.className = "button-reply"
        replyButton.innerText = "reply to this comment"

        replyButton.addEventListener("click", (event) => {
            event.preventDefault(),
            handleReply(picture, postCard, divComment)
        })

        const editCommentButton = document.createElement("button")
        editCommentButton.innerText = "Edit this comment"

        editCommentButton.addEventListener("click", (event) => {
            event.preventDefault()

            const editForm = document.createElement("form")

            const editInputComment = document.createElement("input")
            editInputComment.type = "text"
            editInputComment.name = "comment"
            editInputComment.placeholder = picture.comment

            const editSubmitButton = document.createElement("button")
            editSubmitButton.innerText = "submit edit"
    
                editForm.addEventListener("submit", (event) => {
                    event.preventDefault()
                    handleEditComment(picture, event, postComment)
                })
    
            editForm.append(editInputComment, editSubmitButton)
            divComment.append(editForm)
        })

        const postClapsButton = document.createElement("button")
        postClapsButton.className = "button-clap"
        postClapsButton.innerText = `Claps: ${parseInt(picture.claps)}`

        postClapsButton.addEventListener("click", (event) => {
            event.preventDefault();
            console.log(event)

            fetch(picturesURL + `/${picture.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json"
                },
                body: JSON.stringify({claps: picture.claps + 1}),
            }).then(resp => resp.json())
            //update in real time without refreshing the page
            picture.claps += 1
            postClapsButton.innerText = `Claps: ${parseInt(picture.claps)}`
        })

        const postEditButton = document.createElement("button")
        postEditButton.className = "button-edit"
        postEditButton.innerText = "Edit"

            postEditButton.addEventListener("click", event => {
                event.preventDefault()
                console.log("Edit")
                handleEditButton(picture, postCard)
            })

        const postDeleteButton = document.createElement("button")
        postDeleteButton.className = "button-delete"
        postDeleteButton.innerText = "Delete"

            postDeleteButton.addEventListener("click", event => {
                event.preventDefault(),
                handleDeleteButton(picture, postCard)
            })

        postCard.append(postUsername, postPicture, divComment, editCommentButton, replyButton, postClapsButton, postDeleteButton)
        divComment.append(postComment, editCommentButton)
        postCollection.append(postCard)


       const pictureComments = commentsArr.filter(comment => comment.pictureId === picture.id)

      console.log(picture.id, pictureComments)
    
        const renderComments = (comments) => {
            comments.forEach( comment => renderComment(comment) )
        }
        
        const renderComment = comment => {
                 
            const newPReply = document.createElement("h4")
            
            newPReply.innerText = `@${comment.username}: ${comment.usercomment}`
    
            divComment.append(newPReply)
                
        }

        renderComments(pictureComments)
    }


    const handleEditComment = (picture, e, postComment) => {

        //debugger
        const edittedComment = e.target.comment.value
        fetch(picturesURL + `/${picture.id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json"
            },
            body: JSON.stringify({

                comment: edittedComment
            })
        }).then(resp => resp.json())
        
        comment = edittedComment
        postComment.innerText = edittedComment
        //debugger   

    }



    const handleReply = (picture, postCard, divComment) => {
        const replyForm = document.createElement("form")

        const inputName = document.createElement("input")
        inputName.type = "text"
        inputName.name = "username"
        inputName.placeholder = "Enter your name..."

        const inputComment = document.createElement("input")
        inputComment.type = "text"
        inputComment.name = "usercomment"
        inputComment.placeholder = "Enter your comment..."

        const replySubmitButton = document.createElement("button")
        replySubmitButton.innerText = "submit reply"
        
            replyForm.addEventListener("submit", (event) => {
                event.preventDefault()
                handleReplySubmit(picture, divComment, event)
            })

        replyForm.append(inputName, inputComment, replySubmitButton)
        postCard.append(replyForm)
    }

    const handleReplySubmit = (picture, divComment, e) => {

        replyUserName = e.target.username.value
        replyUserComment = e.target.usercomment.value

            //debugger
        fetch(commentsURL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json"
            },
            body: JSON.stringify({
                pictureId: picture.id,
                username: replyUserName,
                usercomment: replyUserComment
            })
        }).then(resp => resp.json())
        .then( () => {
            const newPComment = document.createElement("h4")
            newPComment.innerText = `@${replyUserName}: ${replyUserComment}`

            divComment.append(newPComment)

        } )

    }


    const handleDeleteButton = (picture, postCard) => {
        const configObject = {
            method: "DELETE"
        }
        fetch(picturesURL + `/${picture.id}`, {
            method: "DELETE"
        }).then( postCard.remove() )

    }

    const handleEditButton = (picture, postCard) => {
        console.log("Edited this pic")
        
        fetch(picturesURL + `/${picture.id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json"
            },
            //body: JSON.stringify({}),
        }).then(resp => resp.json())
        .then(getPictures())


    }

    const getComments = () => {
        return fetch(commentsURL)
        .then(resp => resp.json())
        .then(comments => {
            commentsArr = comments
            getPictures()
        })
    }

    getComments()
})