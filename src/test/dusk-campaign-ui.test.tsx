import {beforeEach,describe,it,expect,vi} from 'vitest';
import {render,screen,fireEvent,waitFor} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import DuskCampaignMeasurement from '@/components/DuskCampaignMeasurement';
import {campaignLink} from '@/lib/dusk/campaign';
const request=vi.fn();
beforeEach(()=>{vi.stubGlobal('fetch',request);request.mockReset();request.mockResolvedValue({ok:true});});
describe('DUSK measurement UI',()=>{
 it('makes no measurement request without consent, stops after withdrawal',async()=>{
   const url=new URL(campaignLink('h2','instagram'));
   render(<MemoryRouter initialEntries={[url.pathname+url.search]}><DuskCampaignMeasurement/></MemoryRouter>);
   expect(request).not.toHaveBeenCalled();
   fireEvent.click(screen.getByText('Allow measurement for this page'));
   await waitFor(()=>expect(request).toHaveBeenCalledTimes(1));
   expect(JSON.parse(request.mock.calls[0][1].body).attribution.variant_id).toBe('h2');
   fireEvent.click(screen.getByText('Stop further measurement'));
   fireEvent.click(screen.getByText('Read the Pinealon cell study'));
   expect(request).toHaveBeenCalledTimes(1);
 });
 it('does not show measurement controls for another campaign',()=>{
   const {container}=render(<MemoryRouter initialEntries={['/dusk?utm_campaign=another']}><DuskCampaignMeasurement/></MemoryRouter>);
   expect(container.textContent).toBe('');expect(request).not.toHaveBeenCalled();
 });
 it('reports unavailable measurement without blocking the study link',async()=>{
   request.mockResolvedValueOnce({ok:false});const url=new URL(campaignLink('h1','organic'));
   render(<MemoryRouter initialEntries={[url.pathname+url.search]}><DuskCampaignMeasurement/></MemoryRouter>);
   fireEvent.click(screen.getByText('Allow measurement for this page'));
   expect(await screen.findByRole('status')).toHaveTextContent('unavailable');
   expect(screen.getByText('Read the Pinealon cell study')).toHaveAttribute('href','https://pubmed.ncbi.nlm.nih.gov/21978084/');
 });
});
