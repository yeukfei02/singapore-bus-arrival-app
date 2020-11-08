import React from 'react';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { shallow, mount } from 'enzyme';

Enzyme.configure({ adapter: new Adapter() });

import MainView from '../components/mainView/MainView';
import NearMe from '../components/nearMe/NearMe';
import Search from '../components/search/Search';
import Settings from '../components/settings/Settings';

describe('main.test', () => {
  describe('render test', () => {
    test('MainView', () => {
      const wrapper = shallow(<MainView />);
      expect(wrapper).toMatchSnapshot();
    });

    test('NearMe', () => {
      const wrapper = shallow(<NearMe />);
      expect(wrapper).toMatchSnapshot();
    });

    test('Search', () => {
      const wrapper = shallow(<Search />);
      expect(wrapper).toMatchSnapshot();
    });

    test('Settings', () => {
      const wrapper = shallow(<Settings />);
      expect(wrapper).toMatchSnapshot();
    });
  });
});
