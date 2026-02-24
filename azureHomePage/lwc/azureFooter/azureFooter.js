import { LightningElement, api } from 'lwc';

export default class AzureFooter extends LightningElement {
    @api tagline   = 'A sanctuary for the soul, where luxury meets the raw beauty of nature. Experience transcendence in the unimaginable.';
    @api copyright = '© 2026 The Azure Sanctuary. All rights reserved.';

    socials = [
        { label: 'Instagram', abbr: 'IG', href: '#' },
        { label: 'Facebook',  abbr: 'FB', href: '#' },
        { label: 'X / Twitter', abbr: '𝕏', href: '#' },
    ];

    footerCols = [
        {
            heading: 'Explore',
            links: [
                { label: 'Our Story',        href: '#' },
                { label: 'Suites & Villas',  href: '#' },
                { label: 'Private Events',   href: '#' },
                { label: 'Dining',           href: '#' },
                { label: 'Wellness',         href: '#' },
            ]
        },
        {
            heading: 'Support',
            links: [
                { label: 'Reservations',    href: '#' },
                { label: 'Press Inquiries', href: '#' },
                { label: 'Careers',         href: '#' },
            ]
        },
        {
            heading: 'Legal',
            links: [
                { label: 'Privacy Policy', href: '#' },
                { label: 'Terms of Use',   href: '#' },
                { label: 'Cookie Policy',  href: '#' },
            ]
        }
    ];
}
