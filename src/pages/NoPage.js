// Home.js
import React from 'react';
import HomepageImage from '../components/HomepageImage'
import { styled } from '@mui/system';
import { Grid, Button, TextField } from '@mui/material';
import { useHistory } from 'react-router-dom';



// export default Authentication;

export default function NoPage() {
  return (
    <>
      <HomepageImage />
      <h2>Error 404: Not Found</h2>
    </>
  );
}
