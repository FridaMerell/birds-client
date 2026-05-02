'use client';

interface Props {
	itemsCount: 0,
	pageSize: 0,
	currentPage: 0,
	onPageChange: (newPage: number) => {},
}

const Pagination = ({itemsCount, pageSize, currentPage, onPageChange}: Props) => {
	const pagesCount = Math.ceil(itemsCount / pageSize);
	if (pagesCount === 1) return null;
	const pages = Array.from({length: pagesCount}, (_, i) => i + 1);

	return <nav>
		<ul className="pagination">
			{pages.map(page => (
				<li key={page} className={page === currentPage ? "page-item active" : "page-item"}>
					<a onClick={() => onPageChange(page)} className="page-link">{page}</a>
				</li>
			))}
		</ul>
	</nav>

};