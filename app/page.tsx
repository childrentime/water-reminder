'use client';
import React, { useState } from 'react';
import { useWebNotification, useInterval } from '@reactuses/core'
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { GlassWater } from 'lucide-react';

const WaterReminder = () => {
  const [isActive, setIsActive] = useState(false);
  const [isTestMode, setIsTestMode] = useState(false);
  const [waterIntake, setWaterIntake] = useState(0);
  const { isSupported, show, ensurePermissions } = useWebNotification(true);

  // 计算建议喝水量（基于平均每天2000ml，醒着的16小时内）
  const recommendedWaterPerHour = 125; // ml/hour (2000ml / 16 hours)
  
  // 根据测试模式设置不同的时间间隔
  const INTERVAL_TIME = isTestMode ? 10000 : 3600000; // 测试模式 10 秒，正常模式 1 小时

  const sendNotification = async () => {
    const timeMsg = isTestMode ? '10秒' : '一小时';
    console.log(`已经过去${timeMsg}了，建议喝水${recommendedWaterPerHour}ml，保持健康水分摄入！`);
    const notification = show(
      '喝水提醒',
      {
        body: `已经过去${timeMsg}了，建议喝水${recommendedWaterPerHour}ml，保持健康水分摄入！\n今日已喝水量：${waterIntake}ml`,
      }
    );
    console.log('notification', notification);

    // 点击通知时增加水分摄入量
    notification?.addEventListener('click', () => {
      setWaterIntake(prev => prev + recommendedWaterPerHour);
      notification.close();
    });
  };

  // 使用 useInterval 来处理定时逻辑
  useInterval(
    sendNotification,
    isActive ? INTERVAL_TIME : null // 当 isActive 为 false 时传入 null 来暂停定时器
  );

  // 每天凌晨重置喝水量
  useInterval(
    () => {
      const now = new Date();
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        setWaterIntake(0);
      }
    },
    60000 // 每分钟检查一次
  );

  const handleToggle = async (checked: boolean) => {
    if (checked) {
      const granted = await ensurePermissions();
      if (granted) {
        setIsActive(true);
        // 立即发送第一条通知
        sendNotification();
      }
    } else {
      setIsActive(false);
    }
  };

  const addWater = (amount: number) => {
    setWaterIntake(prev => prev + amount);
  };

  const toggleTestMode = () => {
    setIsTestMode(prev => !prev);
  };

  if (!isSupported) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>喝水助手</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">
            很抱歉，您的浏览器不支持通知功能。
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GlassWater className="h-6 w-6" />
          喝水助手
        </CardTitle>
        <Button onClick={() => {
          show('4123423')
        }}>
          41234412
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="notifications"
              checked={isActive}
              onCheckedChange={handleToggle}
            />
            <Label htmlFor="notifications">
              开启提醒
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="test-mode"
              checked={isTestMode}
              onCheckedChange={toggleTestMode}
            />
            <Label htmlFor="test-mode">
              测试模式（10秒提醒一次）
            </Label>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-lg font-medium">
            今日已喝水量：{waterIntake}ml
          </p>
          <p className="text-sm text-gray-500">
            建议每{isTestMode ? '10秒' : '小时'}喝水：{recommendedWaterPerHour}ml
          </p>
          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => addWater(200)}
              className="flex-1"
            >
              喝了200ml
            </Button>
            <Button
              variant="outline"
              onClick={() => addWater(500)}
              className="flex-1"
            >
              喝了500ml
            </Button>
          </div>
        </div>

        {isActive && (
          <p className="text-sm text-green-600">
            已开启提醒，将会每{isTestMode ? '10秒' : '小时'}通知您喝水
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default WaterReminder;