// Team.js
import React from 'react';
import teamPhoto from '../assets/teamPhotoCapstone.jpg'; // Import the photo file
const Team = () => {
    return  <>
      <h2>Our Team:</h2>
      <img src={teamPhoto} alt="Team Photo" style={{ width: '500px', height: 'auto' }} /> {/* Use the imported photo */}
      <ul>
        <li>Marcus Moore</li>
        <li>Michael Martinez-Posadas</li>
        <li>Matvey Starchenko</li>
        <li>Raza Hadir</li>
        <li>Alan Leal</li>
      </ul>
     </>
};

export default Team;