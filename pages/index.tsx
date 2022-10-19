import React from 'react';
import { GetStaticProps, InferGetStaticPropsType } from 'next';
import { Layout } from '@components/Layout';
import { PlantCollection } from '@components/PlantCollection';
import { getPlantList } from '@api/index';

type HomeProps = { plants: Plant[] }

export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  const plants = await getPlantList({limit: 10});
  return {
    props: {
      plants
    }
  }
}

const Home = ({plants}: InferGetStaticPropsType<typeof getStaticProps>) => {    
  return (
    <Layout>
        <PlantCollection plants={plants} variant='square'/>
    </Layout>
  )
}

export default Home;