import Head from 'next/head'
import doctor from  '../../public/img/doctors.svg'
import Link from 'next/link'
import Image from 'next/image'

const Home = () => {
  return (
    <div className=" min-h-screen">
      <Head>
        <title>VirtualCare - Telemedicine Web Application</title>
        <meta name="description" content="VirtualCare is a telemedicine web application that enables patients to receive medical care from anywhere in the world." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">VirtualCare</h1>
        <p className="text-lg text-gray-400 text-center mb-8">A telemedicine web application that enables patients to receive medical care from anywhere in the world.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <Image src={doctor} alt="VirtualCare" className="rounded-lg shadow-lg" />
          <div>
            <h2 className="text-2xl font-bold mb-4">How It Works</h2>
            <ol className="list-decimal pl-6">
              <li className="mb-2">Sign up for an account on VirtualCare</li>
              <li className="mb-2">Schedule a consultation with a healthcare professional</li>
              <li className="mb-2">Join the video conference at the scheduled time</li>
              <li className="mb-2">Communicate with your healthcare provider about your medical information</li>
              <li className="mb-2">Receive a diagnosis and treatment plan from your healthcare provider</li>
            </ol>
          </div>
        </div>
        <div className='text-center mx-5 my-20'>
          <Link href={"/try"} className='text-2xl font-bold text-black py-3 px-10 rounded-full bg-green-400  '>Try Now</Link>
        </div>
      </main>
    </div>
  )
}

export default Home
