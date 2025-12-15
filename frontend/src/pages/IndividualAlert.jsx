import React from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';

const IndividualAlert = () => {
  const { id } = useParams();

  return (
    <div>
      <Navbar />
      <h1> .</h1>
      <h1>Individual alert {id}</h1>
    </div>
  );
};

export default IndividualAlert;
