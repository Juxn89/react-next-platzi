import Link from 'next/link';
import { GetStaticProps, InferGetStaticPropsType } from 'next';
import { Layout } from '@components/Layout'
import { RichText } from '@components/RichText'
import { AuthorCard } from '@components/AuthorCard'
import { PlantEntryInline } from '@components/PlantCollection';
import { Grid } from '@ui/Grid'
import { Typography } from '@ui/Typography'
import { getCategoryList, getPlant, getPlantList } from '@api'
import { useRouter } from 'next/router';

type PathType = {
  params: {
    slug: string
  }
}

export const getStaticPaths = async () => {
  const entries = await getPlantList({limit: 10})
  const paths: PathType[] = entries.map(plant => ({
    params: {
      slug: plant.slug
    }
  }))

  return {
    paths,
    //fallback: 'blocking', // wait until HTTP is done
    fallback: true, // let the component handle it
    // fallback: false, // 404
  }
}

type PlantEntryProps = {
  plant: Plant
  otherEntries: Plant[] | null
  categories: Category[] | null
}

export const getStaticProps: GetStaticProps<PlantEntryProps> = async ({ params }) => {
  const slug = params?.slug;

  if(typeof slug !== 'string') {
    return {
      notFound: true
    }
  }

  try {
    const plant = await getPlant(slug);
    const otherEntries = await getPlantList({limit: 5})
    const categories = await getCategoryList({limit: 10});

    return {
      props: {
        plant,
        otherEntries,
        categories
      },
      revalidate: 5 * 60 // referesh 5 min
    }

  } catch (error) {
        return {
      notFound: true
    }
  }
}

export default function PlantEntryPage({ plant, otherEntries, categories }: InferGetStaticPropsType<typeof getStaticProps>) {
  const router = useRouter();

  if(router.isFallback) {
    return (
      <Layout>
        Loading awesomeness... 
      </Layout>
    )
  }

  if(plant === null) {
    return (
      <Layout>
          <main>
              404, my friend
          </main>
      </Layout>
    )
  }

  return (
    <Layout>
        <Grid container spacing={4} >
            <Grid item xs={12} md={8} lg={9} component="article">
                <figure>
                    <img width={952} src={plant.image.url} alt={plant.image.title} />
                </figure>
                <div className="px-12 pt-8">
                    <Typography variant="h2">{plant.plantName} </Typography>
                </div>
                <div className="p-10">
                    <RichText richText={plant.description} />
                </div>
            </Grid>
            <Grid item xs={12} md={4} lg={3} component="aside">
                <section>                    
                    <Typography variant="h5" component="h3" className="mb-4" > 
                        Recent post
                    </Typography>
                </section>
                {otherEntries?.map((plantEntry) => (
                    <article className='mb-4' key={plantEntry.id}>
                        <PlantEntryInline {...plantEntry}/>
                    </article>
                ))}
                <section className='mt-10'>
                    <Typography variant="h5" component="h3" className='mb-4'>
                        Categories
                    </Typography>
                    <ul className='list'>
                        {categories?.map((category) => (
                        <li key={category.id}>
                            <Link passHref href={`/category/${category.slug}`}>
                                <Typography variant="h6" component="a">
                                    {category.title}
                                </Typography>
                            </Link>                                 
                        </li>
                        ))}
                    </ul>
                </section>
            </Grid>
        </Grid>
        <section className='my-4 border-t-2 border-b-2 border-gray-200 pt-12 pb-7'>
            <AuthorCard {...plant.author} />
        </section>
    </Layout>
  )
}