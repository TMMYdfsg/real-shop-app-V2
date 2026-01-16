import { BankerLayout } from '@/components/layout/BankerLayout';

export default function Layout({ children }: { children: React.ReactNode }) {
    return <BankerLayout>{children}</BankerLayout>;
}
