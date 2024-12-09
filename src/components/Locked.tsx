import { useEffect } from 'react';
import { useNavigate } from 'react-router';

export function Locked({ href }: { href: string }) {
	let navigate = useNavigate();

	useEffect(() => {
		navigate(href);
	}, []);

	return undefined;
}
