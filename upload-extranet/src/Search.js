// == Import : npm
import React, { useState, useReducer } from "react";
import { getToken } from './appMiddleware';
import { reducer } from './appReducer';
import { initialState } from './appReducer';
import { styleDatas } from './styleDatas';
import styled from "styled-components"

import Axios from 'axios';
// import './search.scss';

const H1 = styled.h1`
  color: 'red';
`;

const Search = () => {
    const [state, dispatch] = useReducer(reducer, initialState);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [clicked, setClicked] = useState(false);
    const [opened, setOpened] = useState(false);
    const [arrayTracks, setarrayTracks] = useState([]);


    const handleChange = (e) => {
        setSearchTerm(e.target.value.toLowerCase());
    };


    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading({ loading: true });

        const getApiData = async token => {

            const res = await Axios.get(`https://api.spotify.com/v1/search?&type=track`, {
                params: {
                    q: `${searchTerm}`
                },
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            })

            console.log("ma reponse api track est", res);
            return res;
        }

        if (searchTerm !== 0) {
            // setTimeout(() => {
            const FetchData = async () => {
                const token = await getToken();
                const data = await getApiData(token);

                dispatch({
                    type: 'FETCH_DATA',
                    payload: data,
                })
            }

            FetchData();
            setLoading(false);
            setClicked(false);
            // }, 2000);

        } else {
            console.log('en attente d\'une recherche');
        }

    };





    const handleSubmitId = (currentId, currentName, currentNameArtist, currentCoverLinkTrack, currentDate, currentSpotifyLink, currentSpotifyTrackId) => {

        const id = currentId;
        const title = currentName;
        const author = currentNameArtist;
        const spotifyCoverLink = currentCoverLinkTrack;
        const year = currentDate;
        const spotifyLink = currentSpotifyLink;
        const spotifyTrackId = currentSpotifyTrackId;


        const getApiArtist = async (token, id, ) => {
            console.log("mon id", id);
            const resArtist = await Axios.get(`	https://api.spotify.com/v1/artists/${id}`, {

                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            console.log("ma reponse api artist est", resArtist.data.genres);
            return resArtist.data.genres;
        }


        const FetchDataArtist = async () => {
            const token = await getToken();
            const genreArtist = await getApiArtist(token, id);
            const genreArtistFilter = styleFilter(genreArtist);
            console.log(genreArtistFilter);
            const style = genreArtistFilter;

            const arrayTrack = [
                { title },
                { author },
                { style },
                { year },
                { spotifyLink },
                { spotifyCoverLink },
                { spotifyTrackId },
            ];
            console.log('tableau arr  ytrack est ', arrayTrack);
            setarrayTracks(arrayTrack);
        }
        FetchDataArtist();
        setLoading(false);
        setClicked(true)
    }



    const styleFilter = (genreArtist) => {
        const styleDatasArray = styleDatas.map(styleData => styleData.value);
        let styles = [];


        const styleSpotify = genreArtist;
        // console.log("mon tableau stylespoti est",styleSpotify);


        styleSpotify.map(style => {

            if (styleDatasArray.includes(style)) {
                styles = [...styles, style];
            }
            return null;
        });

        return styles.length > 0 ? styles[0] : "Autres";
    };

 

    //googlesheet part


    const handleSubmitGoogleSheet = () => {


        console.log(arrayTracks);

        const finalArray = arrayTracks.map(item => Object.values(item).join(''));
        console.log("ma ligne de code qui remet en question tout un code : ", finalArray);
        let dataFinal = [];
        dataFinal.push(finalArray);

        let payload = dataFinal;
        console.log('je clique pour envoyer des données à mon serveur', payload);


        Axios.post('http://localhost:5000/', {
            data: dataFinal
        })
            .then(function (response) {
                console.log('yes le serveur receptionne', response);
                // alert("Le document googleSheet a bien était mit à jour");
            })
            .catch(function (error) {
                console.log('et nope', error);
            });
        setOpened(false);

    }

    console.log(arrayTracks);



    return (
        <div id="search">
            <div id="search-container">
                <H1 >cherche un titre via l'api spotify</H1>
                <form>
                    <label id="search-label" >
                        <input
                            type="text"
                            id="search-input"
                            placeholder="rechercher..."
                            onChange={handleChange}
                        />
                    </label>
                    <button id="search-button" type="submit" onClick={handleSubmit}>Envoyer</button>
                </form>

                <div id="search-containerListSearch">
                    {!loading ?
                        <ul id="search-ul">

                            {state.items.map((item, key) =>

                                <li
                                    key={key}
                                    id="search-li"
                                    onClick={() => handleSubmitId(
                                        item.artists[0].id,
                                        item.name,
                                        item.artists[0].name,
                                        item.album.images[0].url,
                                        item.album.release_date.slice(0, 4),
                                        item.external_urls.spotify,
                                        item.id,
                                    )}
                                >
                                    <div id="search-containerInfos">
                                        <img id="search-cover" src={`${item.album.images[0].url}`} alt=""></img>
                                        <h2 id="search-h2">{item.name} - {item.artists[0].name}
                                            <span id="search-span"> {item.album.release_date.slice(0, 4)}</span>
                                        </h2>
                                    </div>

                                    <p id="search-paragraph">SpotifyLink : <span id="search-spanParagraph"> {item.external_urls.spotify}</span></p>
                                    <p id="search-paragraph">SpotifyCoverLinkTrack : <span id="search-spanParagraph">{item.album.images[0].url}</span></p>
                                    <p id="search-paragraph">SpotifyTrackId : <span id="search-spanParagraph">{item.id}</span></p>

                                </li>
                            )}
                        </ul>
                        : <p>En attente d'une recherche...<img src="./animal.png" id="search-imgloader" alt=""></img></p>}
                </div>
            </div>

            <div id="search-containerResultList">
                <h1 id="search-h1">Ma liste de titres spotify</h1>
                {clicked && !loading && arrayTracks && arrayTracks.length > 0 ?
                    <div id="search-containerInformations">
                        {/* { opened ? 
        <div id="search-confirmSend">
                  <h3 id= "search-h3">Êtes-vous sûr de vouloir ajouter ces informations à googleSheet ?</h3>
                  <div id ="search-containerButtonChoice">
                    <button id="search-cancel"onClick={handleCancelSubmit}>Annuler</button> 
                    <button id="search-valid" onClick={handleSubmitGoogleSheet}>Confirmer</button> 
                  </div>
                </div>
      : null } */}
                        <div id="search-containerInformationsClicked" >
                            <button id="search-updateGoogleSheet" onClick={handleSubmitGoogleSheet}>Mettre à jour dans GoogleSheet</button>
                            <div id="search-containerCover">
                                <img id="search-cover" src={`${arrayTracks[5].spotifyCoverLink}`} alt=""></img>
                            </div>
                            <div id="search-containerInfosToUpdate">
                                <p id="search-paragraph" >Titre : <span id="search-spanParagraph"> {arrayTracks[0].title} </span></p>
                                <p id="search-paragraph" >Artist : <span id="search-spanParagraph"> {arrayTracks[1].author} </span> </p>
                                <p id="search-paragraph" >Genre :  <span id="search-spanParagraph"> {arrayTracks[2].style} </span> </p>
                                <p id="search-paragraph" >Date :  <span id="search-spanParagraph"> {arrayTracks[3].year} </span></p>
                                <p id="search-paragraph" >SpotifyLink :  <span id="search-spanParagraph"> {arrayTracks[4].spotifyLink}</span> </p>
                                <p id="search-paragraph" >SpotifyCoverLinkTrack :  <span id="search-spanParagraph"> {arrayTracks[5].spotifyCoverLink}</span> </p>
                                <p id="search-paragraph" >SpotifyTrackId :  <span id="search-spanParagraph"> {arrayTracks[6].spotifyTrackId} </span></p>
                            </div>
                            {/* <button id="search-updateGoogleSheet" onClick={handleConfirmSubmit}>Mettre à jour dans GoogleSheet</button> */}

                        </div>




                    </div>
                    : null}
            </div>
        </div>

    );
};
// == Export
export default Search;