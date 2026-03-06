import type { AppProps } from 'next/app'
import { ReactNode } from 'react'
import '@/styles/globals.css'

export default function App({ Component, pageProps }: AppProps): ReactNode {
  return <Component {...pageProps} />
}
