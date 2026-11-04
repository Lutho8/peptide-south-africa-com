import { beforeEach, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import AuthPage from '@/pages/AuthPage';
const mocks=vi.hoisted(()=>({signUp:vi.fn(),signInWithPassword:vi.fn(),signInWithOAuth:vi.fn(),toast:vi.fn()}));
vi.mock('@/hooks/useAuth',()=>({useAuth:()=>({user:null})}));
vi.mock('@/integrations/supabase/client',()=>({supabase:{auth:mocks}}));
vi.mock('@/hooks/use-toast',()=>({useToast:()=>({toast:mocks.toast})}));
beforeEach(()=>vi.clearAllMocks());
function open(path:string){render(<HelmetProvider><MemoryRouter initialEntries={[path]}><Routes><Route path='/auth' element={<AuthPage/>}/><Route path='/checkout' element={<p>Saved checkout returned</p>}/></Routes></MemoryRouter></HelmetProvider>);}
it('returns legacy next=checkout sign-ins to checkout',async()=>{mocks.signInWithPassword.mockResolvedValue({error:null});open('/auth?next=/checkout');fireEvent.change(screen.getByPlaceholderText('you@example.com'),{target:{value:'test@example.invalid'}});fireEvent.change(screen.getByPlaceholderText('Password'),{target:{value:'fixture-only'}});fireEvent.click(screen.getByRole('button',{name:'Sign in'}));await waitFor(()=>expect(screen.getByText('Saved checkout returned')).toBeInTheDocument());});
it('keeps unconfirmed signup on clear email instructions',async()=>{mocks.signUp.mockResolvedValue({data:{session:null},error:null});open('/auth?redirect=/checkout');fireEvent.click(screen.getByRole('button',{name:"Don't have an account? Sign up"}));fireEvent.change(screen.getByPlaceholderText('you@example.com'),{target:{value:'test@example.invalid'}});fireEvent.change(screen.getByPlaceholderText('Password'),{target:{value:'fixture-only'}});fireEvent.click(screen.getByRole('button',{name:'Create account'}));await waitFor(()=>expect(screen.getByRole('status')).toHaveTextContent('Check your inbox'));expect(screen.queryByText('Saved checkout returned')).not.toBeInTheDocument();});
it('preserves checkout on Google callback',async()=>{mocks.signInWithOAuth.mockResolvedValue({data:{},error:null});open('/auth?redirect=/checkout');fireEvent.click(screen.getByRole('button',{name:'Continue with Google to sign in to Peptide South Africa'}));await waitFor(()=>expect(mocks.signInWithOAuth).toHaveBeenCalledWith({provider:'google',options:{redirectTo:expect.stringContaining('/auth?redirect=%2Fcheckout')}}));});
