import { useState, useEffect, useCallback } from 'react';

import { searchGithub, searchGithubUser } from '../api/API';
import CandidateCard from '../components/CandidateCard';
import type { Candidate } from '../interfaces/Candidate.interface';

const CandidateSearch = () => {
  const [results, setResults] = useState<Candidate[]>([]);
  const [currentUser, setCurrUser] = useState<Candidate>({
    id: null,
    login: null,
    email: null,
    html_url: null,
    name: null,
    avatar_url: null,
    bio: null,
    company: null,
    location: null,
  });
  
  const [currentIdx, setCurrentIdx] = useState<number>(0);

  const getSpecificUser = useCallback(async (user: string) => {
    const data: Candidate = await searchGithubUser(user);

    setCurrUser(data);
  },[]);

  const getUsers = useCallback(async () => {
    const data: Candidate[] = await searchGithub();

    setResults(data);

    await getSpecificUser(data[currentIdx].login || '');
  }, [currentIdx, getSpecificUser]);

  const selectUser = async (isSelected: boolean) => {
    if (isSelected) {
      let parsedCandidates: Candidate[] = [];
      const savedCandidates = localStorage.getItem('savedCandidates');
      if (typeof savedCandidates === 'string') {
        parsedCandidates = JSON.parse(savedCandidates);
      }
      parsedCandidates.push(currentUser);
      localStorage.setItem('savedCandidates', JSON.stringify(parsedCandidates));
    }
    if (currentIdx + 1 < results.length) {
      setCurrentIdx(currentIdx + 1);
      await getSpecificUser(results[currentIdx + 1].login || '');
    } else {
      setCurrentIdx(0);
      await getUsers();
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: Dependency array is correct
  useEffect(() => {
    getUsers();
    getSpecificUser(currentUser.login || '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <h1>Candidate Search</h1>
      <CandidateCard currentUser={currentUser} selectUser={selectUser} />
    </>
  );
};

export default CandidateSearch;
