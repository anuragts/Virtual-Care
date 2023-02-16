import Navbar from "./Navbar";

type Props = {
    children: React.ReactNode;
  };
export default function Layout({ children }: Props) {
    return (
        <>
        <Navbar />
        {children}
        </>
    )
}