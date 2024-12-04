import { Carousel, Tooltip } from 'antd';
import { useEffect, useState } from 'react';

import { AppInfo } from '@/shared/types';
import { Card, Column, Content, Footer, Header, Image, Layout, Row, Text } from '@/ui/components';
import { Empty } from '@/ui/components/Empty';
import { NavTabBar } from '@/ui/components/NavTabBar';
import { SwitchNetworkBar } from '@/ui/components/SwitchNetworkBar';
import { TabBar } from '@/ui/components/TabBar';
import { useReadApp } from '@/ui/state/accounts/hooks';
import { useAppList, useBannerList, useLastFetchInfo } from '@/ui/state/discovery/hooks';
import { discoveryActions } from '@/ui/state/discovery/reducer';
import { useAppDispatch } from '@/ui/state/hooks';
import { useChain, useChainType } from '@/ui/state/settings/hooks';
import { useWallet } from '@/ui/utils';

import { SwitchChainModal } from '../Settings/SwitchChainModal';

function BannerItem({ img, link }: { img: string; link: string }) {
  return (
    <Row
      justifyCenter
      onClick={() => {
        window.open(link);
      }}>
      <Image src={img} width={300} height={98} />
    </Row>
  );
}

function AppItem({ info }: { info: AppInfo }) {
  const readApp = useReadApp();
  return (
    <Card
      preset="style1"
      style={{
        backgroundColor: 'rgba(30, 31, 36, 1)',
        borderRadius: 16
      }}
      onClick={() => {
        if (info.url) window.open(info.url);
        readApp(info.id);
      }}>
      <Row full>
        <Column justifyCenter>
          <Image src={info.logo} size={48} />
        </Column>

        <Column justifyCenter gap="zero">
          <Row itemsCenter>
            <Text text={info.title} />
            {info.new && <Text text="new!" color="red" />}
          </Row>

          <Tooltip
            title={info.desc}
            overlayStyle={{
              fontSize: '10px',
              lineHeight: '14px'
            }}>
            <div>
              <Text text={info.desc} preset="sub" max2Lines />
            </div>
          </Tooltip>
        </Column>
      </Row>
    </Card>
  );
}

export default function DiscoverTabScreen() {
  const chainType = useChainType();
  const chain = useChain();

  const [tabKey, setTabKey] = useState(0);

  const bannerList = useBannerList();
  const appList = useAppList();
  const lastFetchInfo = useLastFetchInfo();

  const [switchChainModalVisible, setSwitchChainModalVisible] = useState(false);

  const wallet = useWallet();
  const dispatch = useAppDispatch();
  useEffect(() => {
    if (lastFetchInfo.lasfFetchChainType === chainType && Date.now() - lastFetchInfo.lastFetchTime < 1000 * 60 * 1) {
      return;
    }
    wallet
      .getBannerList()
      .then((data) => {
        dispatch(
          discoveryActions.setBannerList({
            bannerList: data,
            chainType
          })
        );
      })
      .catch((e) => {
        dispatch(
          discoveryActions.setBannerList({
            bannerList: [],
            chainType
          })
        );
      });

    wallet
      .getAppList()
      .then((data) => {
        dispatch(
          discoveryActions.setAppList({
            appList: data,
            chainType
          })
        );
      })
      .catch((e) => {
        dispatch(
          discoveryActions.setAppList({
            appList: [],
            chainType
          })
        );
      });
  }, [chainType, lastFetchInfo]);

  useEffect(() => {
    if (tabKey > appList.length - 1) {
      setTabKey(0);
    }
  }, [appList, tabKey]);

  const tabItems = appList.map((v, index) => {
    return {
      key: index,
      label: v.tab,
      children: (
        <Column gap="lg">
          {v.items.map((w) => (
            <AppItem key={w.id} info={w} />
          ))}
        </Column>
      )
    };
  });

  return (
    <Layout>
      <Header
        type="style2"
        LeftComponent={
          <Row>
            <Text preset="title-bold" text={'Explore the Latest'} />
          </Row>
        }
        RightComponent={<SwitchNetworkBar />}
      />
      <Content>
        <Column justifyCenter>
          <Carousel autoplay>
            {bannerList.map((v) => (
              <BannerItem key={v.img} img={v.img} link={v.link} />
            ))}
          </Carousel>

          <Row mt="md" />

          {tabItems.length == 0 ? (
            <Empty />
          ) : (
            <TabBar
              defaultActiveKey={tabKey}
              activeKey={tabKey}
              items={tabItems}
              preset="style1"
              onTabClick={(key) => {
                setTabKey(key);
              }}
            />
          )}

          {tabItems[tabKey] ? tabItems[tabKey].children : null}
        </Column>

        {switchChainModalVisible && (
          <SwitchChainModal
            onClose={() => {
              setSwitchChainModalVisible(false);
            }}
          />
        )}
      </Content>
      <Footer px="zero" py="zero">
        <NavTabBar tab="discover" />
      </Footer>
    </Layout>
  );
}
