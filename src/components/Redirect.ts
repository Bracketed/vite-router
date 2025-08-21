import { useEffect } from 'react';
import { useNavigate } from 'react-router';

export function Redirect({ href }: { href: string }) {
	let navigate = useNavigate();

	useEffect(() => {
		navigate(href);
	}, []);

	return undefined;
}
