import React, { useState, useReducer } from "react";
import Axios from 'axios';
import { reducer, initialState } from './appReducer';
import { getToken } from './appMiddleware';
import { styleDatas } from './styleDatas';
import './upload.scss';
import csv from 'csv';


const Upload = () => {
    const [state, dispatch] = useReducer(reducer, initialState);
    const [arrayTracks, setarrayTracks] = useState([]);

    // convert csv to json file
    const handleFile = (e) => {
        const file = e.target.files[0];

        const reader = new FileReader();
        reader.readAsBinaryString(file);

        reader.onload = () => {
            csv.parse(reader.result, (err, data) => {
                setarrayTracks(data);
            });
        };

    }

    const handleApiSpotify = () => {
        console.log("mon tableau est", arrayTracks);
        const arrayid = arrayTracks.splice(0, 1);
        console.log('j\'enleve ma premiere entrée de tableau', arrayid);

        const arrayIdExtranetTracks = arrayTracks.map(item => Object.values(item[0]).join(''));
        console.log('mon id extranet est', arrayIdExtranetTracks);

        const arrayIdSpotify = arrayTracks.map(item => Object.values(item[3]).join(''));
        console.log('mon id spotify est', arrayIdSpotify);

        // parcourir les id du tableau json afin de faire les requete api spotify par la suite
        setTimeout(() => {
           
            arrayIdSpotify.forEach((id) => {
                //recupèration des infos lié au titre
                const getApiData = async token => {
                        const res = await Axios.get(`https://api.spotify.com/v1/tracks/${id}`, {

                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${token}`,
                            },
                        })
                   
                            

                        
                        //variabilisation des infos lié au titre
                        
                        const title = res.data.name;
                        const artistName = res.data.artists[0].name;
                        const artistId = res.data.artists[0].id;
                        const spotifyCoverLink = res.data.album.images[0].url;
                        const year = res.data.album.release_date.slice(0, 4);
                        const spotifyLink = res.data.external_urls.spotify;
                        const spotifyTrackId = res.data.id;

                        //recupèration du style (grâce à l'id de l'artiste)
                        const getApiArtist = async (token, artistId) => {
                            const resArtist = await Axios.get(` https://api.spotify.com/v1/artists/${artistId}`, {

                                headers: {
                                    Authorization: `Bearer ${token}`,
                                },
                            })

                            return resArtist.data.genres;
                        }
                 
                        const FetchDataArtist = async () => {
                            const token = await getToken();
                            const genreArtist = await getApiArtist(token, artistId);
                            const genreArtistFilter = styleFilter(genreArtist);
                            const style = genreArtistFilter;
                            
                            const arrayTrack = [
                               
                                { title },
                                { artistName },
                                { artistId },
                                { year },
                                { style },
                                { spotifyLink },
                                { spotifyCoverLink },
                                { spotifyTrackId },
                            ];

                         arrayIdExtranetTracks.forEach((idExtra) =>{
                        
                          const idExtranet= arrayTrack.push(idExtra);
                          return idExtranet;
                        });

                            setarrayTracks(arrayTrack);
                

                            //Googlesheet 

                            const finalArray = arrayTrack.map(item => Object.values(item).join(''));
                            let dataFinal = [];
                            
                            dataFinal.push(finalArray);
                         

                            console.log("mon tableau a envoyé dans googlesheet", dataFinal);



                        }
                        FetchDataArtist();
                        console.log('deuxieme requete api');

                        return res;

                    }
           

                    setTimeout(() => {
                        const FetchData = async () => {
                            const token = await getToken();
                            const data = await getApiData(token);

                            dispatch({
                                type: 'FETCH_DATA',
                                payload: data,
                            })
                        }
                        FetchData();
                        console.log('premiere requete api');
                    }, 1000);
            });
 
        }, 2400);



    }



    const styleFilter = (genreArtist) => {
        const styleDatasArray = styleDatas.map(styleData => styleData.value);
        let styles = [];


        const styleSpotify = genreArtist;


        styleSpotify.map(style => {

            if (styleDatasArray.includes(style)) {
                styles = [...styles, style];
            }
            return null;
        });

        return styles.length > 0 ? styles[0] : "Autres";

    }




    return (
        <div className="Upload">
            <form>
                <label>
                    importer un csv
                    <input type="file" onChange={handleFile} />
                </label>

            </form>
            <button onClick={handleApiSpotify}>appelapi</button>


        </div>
    );
}

export default Upload;
