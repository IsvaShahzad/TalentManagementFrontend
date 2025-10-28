import { useQuery } from '@tanstack/react-query'
import { getAllCandidates } from '../api/api'

//not used have to use new hooks 
const useFetchCandidates = () => {
    const { data, isError, isLoading, refetch } = useQuery(
        'allCandidates',
        getAllCandidates,
        { refetchOnWindowFocus: false }
    )

    return { data, isError, isLoading, refetch }
}

export default useFetchCandidates
