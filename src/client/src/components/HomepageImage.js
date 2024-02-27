import React from 'react';
import PasswordImage from '../assets/password.jpg'

function HomepageImage() {
  const url = 'https://cdn.filestackcontent.com/XYrHCaFGRSaq0EPKY1S6';
  return (
    <img src={PasswordImage} style={{width: 650}} alt='Image of Login' />
  );
}

export default HomepageImage;