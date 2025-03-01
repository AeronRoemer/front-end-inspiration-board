
import React, { useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import "./board.css"

import CardList from './cardList.js';
import NewCard from './NewCard.js';

const Board = (props) => {

    // const [allBoards, updateBoards] = useState([]);
    const [cardList, setCardList] = useState([]);
    const [errorMessage, setErrorMessage] = useState(null);
    const [currentBoard, updateBoard] = useState(props.board.board_id);

    const BASE_URL = 'http://localhost:5000/';
 
    // function to obtain promises to update states
    // const BoardState = useCallback(() => {
    //     return(axios.get(`${BASE_URL}boards`));
    // },[allBoards])

    // const CardState = useCallback(() => {
    //     return(axios.get(`${BASE_URL}boards/${currentBoard}/cards`));
    // },[currentBoard, cardList])


    // does not update state until both functions return 
    useEffect(() => {
        axios.get(`${BASE_URL}/boards/${currentBoard}/cards`, {}).then((response) => {
            setCardList(response.data);
        })
    }, [cardList]);

    const addCard = (card) => {
        const newCardList  = [...cardList.cards];
        const post = {text: card.text, emoji: card.emoji}
        axios.post(`${BASE_URL}${card.board_id}/cards`, post)
        .then( (response) => {
        // only add card to board if the post is for this particular board
        if(card.boardName === currentBoard) {
            const newId = response.data.card.id;
        
            newCardList.push({
            card: {
                id: newId,
                text: card.text, 
                emoji: card.emoji,
            }  
            })
        }
        setCardList(newCardList);
        setErrorMessage(null);
        })
        .catch( (error) => {
        setErrorMessage(['Failed to add card.']);
        });

    }

    // delete a card from cardList
    const deleteCard = (id) => {
        let newCardList = [];
        for (const item of cardList.cards) {
        // cardList is pulled from the API, meaning anything in cardList should ideally have a matching id
        if(id === item.card_id) {
            axios.delete(`${BASE_URL}cards/${id}`)
            // if successful, deleted, send confirmation to console
            .then((response) => {
                console.log(`Card ${id} successfully deleted`);
                setErrorMessage(null);
            })
            .catch((error) => {
                // don't add the card back in -- likely this card was deleted from the api after components mounted
                setErrorMessage([`Could not delete card ${id}.`]);
            });
        } else {
            newCardList.push(item);
        }
        }

        setCardList(newCardList);
    }
    const likeCard = (id) => {
        let newCardList = [];
        for (const item of cardList.cards) {
        // cardList is pulled from the API, meaning anything in cardList should ideally have a matching id
        if(id === item.card_id) {
            console.log(item)
            item.likes += 1
            let cardLikes = {likes_count: item.likes}
            axios.put(`${BASE_URL}cards/${id}/like`, cardLikes)
            // if successful, deleted, send confirmation to console
            .then((response) => {
                console.log(`Card ${id} successfully liked`);
                setErrorMessage(null);
            })
            .catch((error) => {
                // don't add the card back in -- likely this card was deleted from the api after components mounted
                setErrorMessage([`Could not like card ${id}.`]);
            });
        } else {
            newCardList.push(item);
        }
        }

        setCardList(newCardList);
    }

    // if currentBoard changed

    const changeCurrentBoard = (board_id) => {  
        updateBoard(board_id);
    }

    // for error message
    const allErrors = (errorData) => {
        const errors = [];
        for(const error of errorData) {
        errors.push(<li>{error}</li>);
        }

        return errors;
    }

    const createNewCard = (message) => {
        axios.post(
            // TODO: Change URI to ENV variable
            `http://localhost:5000/boards/${props.board.board_id}/cards`,
            {message}
        ).then((response) => {
          const cards = [...cardList.cards];
          cards.push(response.data);
          setCardList(cards);
        }).catch((error) => {
          console.log('Error:', error);
          alert('Couldn\'t create a new card.');
        });
      };

    return (
        <div>
        <article className = 'validation-errors-display'>
            <ul className = 'validation-errors-display__list'>
                {errorMessage ? allErrors(errorMessage) : ''}
            </ul>
        </article> 
        <NewCard createNewCard={createNewCard} />
        <section className = 'board-content'>
            {cardList.cards ? <CardList cardData={cardList} deleteCard={deleteCard} likeCard={likeCard}/> : ''}
        </section>
        </div>
    )
    };
    Board.propTypes = {
        board_id: PropTypes.string.isRequired
    };

    export default Board;


