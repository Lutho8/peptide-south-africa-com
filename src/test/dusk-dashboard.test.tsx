import {describe,it,expect,vi,beforeEach} from 'vitest';
import {render,screen,waitFor,fireEvent} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import Page from '@/pages/admin/AdminDuskCampaignPage';
import {SCRIPT_VERSION} from '@/lib/dusk/campaign';
const state=vi.hoisted(()=>({auth:{session:{access_token:'test-only'},isAdmin:true,loading:false}}));
vi.mock('@/hooks/useAuth',()=>({useAuth:()=>state.auth}));
vi.mock('@/components/SEO',()=>({default:()=>null}));
const request=vi.fn();
beforeEach(()=>{state.auth.isAdmin=true;request.mockReset();vi.stubGlobal('fetch',request);});
const mount=()=>render(<MemoryRouter><Page/></MemoryRouter>);
describe('DUSK admin dashboard',()=>{
 it('does not query campaign records for non-admin users',()=>{
  state.auth.isAdmin=false;mount();expect(screen.getByText('Admin access is required.')).toBeInTheDocument();expect(request).not.toHaveBeenCalled();
 });
 it('renders unavailable data as an error rather than zero metrics',async()=>{
  request.mockResolvedValue({ok:false,json:async()=>({error:'Campaign data unavailable'})});mount();expect(await screen.findByRole('alert')).toHaveTextContent('Campaign data unavailable');expect(screen.queryByText(/Reported landings/)).not.toBeInTheDocument();
 });
 it('submits revision-protected script review and refreshes the state',async()=>{
  const row={variant_id:'h1',status:'draft',revision:0,script_version:SCRIPT_VERSION,render:null};
  request.mockResolvedValueOnce({ok:true,json:async()=>({creatives:[row],counts:[{variant_id:'h1',landings:2,source_clicks:1}]})});
  request.mockResolvedValueOnce({ok:true,json:async()=>({ok:true})});
  request.mockResolvedValueOnce({ok:true,json:async()=>({creatives:[{...row,status:'script_reviewed',revision:1}],counts:[]})});
  mount();fireEvent.click(await screen.findByText('Mark script reviewed'));
  await waitFor(()=>expect(request).toHaveBeenCalledTimes(3));
  expect(JSON.parse(request.mock.calls[1][1].body)).toEqual({variant_id:'h1',revision:0,action:'review_script'});
  expect(await screen.findByText('Record reviewed render')).toBeInTheDocument();
 });
});
