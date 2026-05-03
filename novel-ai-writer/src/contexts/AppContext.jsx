import React, { createContext, useContext, useReducer, useEffect } from 'react';
import storageService from '../services/storageService';

const initialState = {
  projects: [],
  characters: [],
  apiSettings: null,
  currentProjectId: null,
  ui: {
    theme: 'dark',
    sidebarCollapsed: false,
    activeTab: 'writing'
  }
};

const ACTIONS = {
  SET_PROJECTS: 'SET_PROJECTS',
  ADD_PROJECT: 'ADD_PROJECT',
  UPDATE_PROJECT: 'UPDATE_PROJECT',
  DELETE_PROJECT: 'DELETE_PROJECT',
  SET_CHARACTERS: 'SET_CHARACTERS',
  ADD_CHARACTER: 'ADD_CHARACTER',
  UPDATE_CHARACTER: 'UPDATE_CHARACTER',
  DELETE_CHARACTER: 'DELETE_CHARACTER',
  SET_API_SETTINGS: 'SET_API_SETTINGS',
  SET_CURRENT_PROJECT: 'SET_CURRENT_PROJECT',
  SET_UI: 'SET_UI'
};

function reducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_PROJECTS:
      return { ...state, projects: action.payload };
    case ACTIONS.ADD_PROJECT:
      return { ...state, projects: [...state.projects, action.payload] };
    case ACTIONS.UPDATE_PROJECT:
      return {
        ...state,
        projects: state.projects.map(p => p.id === action.payload.id ? action.payload : p)
      };
    case ACTIONS.DELETE_PROJECT:
      return {
        ...state,
        projects: state.projects.filter(p => p.id !== action.payload),
        currentProjectId: state.currentProjectId === action.payload ? null : state.currentProjectId
      };
    case ACTIONS.SET_CHARACTERS:
      return { ...state, characters: action.payload };
    case ACTIONS.ADD_CHARACTER:
      return { ...state, characters: [...state.characters, action.payload] };
    case ACTIONS.UPDATE_CHARACTER:
      return {
        ...state,
        characters: state.characters.map(c => c.id === action.payload.id ? action.payload : c)
      };
    case ACTIONS.DELETE_CHARACTER:
      return { ...state, characters: state.characters.filter(c => c.id !== action.payload) };
    case ACTIONS.SET_API_SETTINGS:
      return { ...state, apiSettings: action.payload };
    case ACTIONS.SET_CURRENT_PROJECT:
      return { ...state, currentProjectId: action.payload };
    case ACTIONS.SET_UI:
      return { ...state, ui: { ...state.ui, ...action.payload } };
    default:
      return state;
  }
}

const AppContext = createContext();

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // 加载存储的数据
  useEffect(() => {
    const projects = storageService.load('projects', []);
    const characters = storageService.load('characters', []);
    const apiSettings = storageService.load('apiSettings', null);
    const ui = storageService.load('ui', initialState.ui);
    dispatch({ type: ACTIONS.SET_PROJECTS, payload: projects });
    dispatch({ type: ACTIONS.SET_CHARACTERS, payload: characters });
    if (apiSettings) dispatch({ type: ACTIONS.SET_API_SETTINGS, payload: apiSettings });
    dispatch({ type: ACTIONS.SET_UI, payload: ui });
  }, []);

  // 自动保存
  useEffect(() => {
    storageService.save('projects', state.projects);
  }, [state.projects]);
  useEffect(() => {
    storageService.save('characters', state.characters);
  }, [state.characters]);
  useEffect(() => {
    if (state.apiSettings) storageService.save('apiSettings', state.apiSettings);
  }, [state.apiSettings]);
  useEffect(() => {
    storageService.save('ui', state.ui);
  }, [state.ui]);

  const actions = {
    setProjects: (projects) => dispatch({ type: ACTIONS.SET_PROJECTS, payload: projects }),
    addProject: (project) => dispatch({ type: ACTIONS.ADD_PROJECT, payload: project }),
    updateProject: (project) => dispatch({ type: ACTIONS.UPDATE_PROJECT, payload: project }),
    deleteProject: (id) => dispatch({ type: ACTIONS.DELETE_PROJECT, payload: id }),
    setCharacters: (chars) => dispatch({ type: ACTIONS.SET_CHARACTERS, payload: chars }),
    addCharacter: (char) => dispatch({ type: ACTIONS.ADD_CHARACTER, payload: char }),
    updateCharacter: (char) => dispatch({ type: ACTIONS.UPDATE_CHARACTER, payload: char }),
    deleteCharacter: (id) => dispatch({ type: ACTIONS.DELETE_CHARACTER, payload: id }),
    setApiSettings: (settings) => dispatch({ type: ACTIONS.SET_API_SETTINGS, payload: settings }),
    setCurrentProject: (id) => dispatch({ type: ACTIONS.SET_CURRENT_PROJECT, payload: id }),
    setUI: (ui) => dispatch({ type: ACTIONS.SET_UI, payload: ui })
  };

  return <AppContext.Provider value={{ state, actions }}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}